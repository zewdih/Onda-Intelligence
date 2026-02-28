import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDomainStore } from '../state/useDomainStore';
import type { Beach, PolicyCategory } from '../types/domain';
import { getBeachTypeLabel } from '../data/adapter';
import { STATUS_LABEL } from '../utils/planEngine';
import { countPolicyGaps } from '../utils/policyGapEngine';
import { computeProjectedImpact } from '../utils/impactModel';
import { generateSupportPlan } from '../utils/planEngine';
import MiniChart from '../components/Dashboard/MiniChart';
import RadarChart from '../components/Charts/RadarChart';

const STATUS_PILL: Record<string, string> = {
  needs_assistance: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  making_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  steady: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const SERIES_COLORS = ['#38bdf8', '#a78bfa', '#fbbf24', '#34d399'];

const POLICY_CATEGORIES: PolicyCategory[] = ['Waste Infrastructure', 'Vendor Compliance', 'Community Programs', 'Enforcement', 'Monitoring'];
const CAT_COLORS: Record<string, string> = {
  'Waste Infrastructure': '#38bdf8',
  'Vendor Compliance': '#a78bfa',
  'Community Programs': '#fbbf24',
  'Enforcement': '#f87171',
  'Monitoring': '#34d399',
};

export default function Compare() {
  const store = useDomainStore();
  const beaches = store.beaches;
  const policySet = store.policySet;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pre-select first two beaches so the page is populated on load
  useEffect(() => {
    if (beaches.length >= 2 && selectedIds.length === 0) {
      setSelectedIds([beaches[0].id, beaches[1].id]);
    }
  }, [beaches]);

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selected = useMemo(
    () => selectedIds.map(id => beaches.find(b => b.id === id)).filter((b): b is Beach => !!b),
    [selectedIds, beaches],
  );

  const types = selected.map(b => b.beachType);
  const sharedType = types.length >= 2 && types.every(t => t === types[0]) ? types[0] : null;

  // Radar chart data
  const radarAxes = useMemo(() => {
    if (selected.length < 2) return [];
    const maxTrash = Math.max(...beaches.map(b => b.estimatedTrashTonsMonthly), 1);
    return [
      { label: 'Pollution', values: selected.map((b, i) => ({ name: b.name, value: b.pollutionScore / 100, color: SERIES_COLORS[i] })) },
      { label: 'Trash Vol.', values: selected.map((b, i) => ({ name: b.name, value: b.estimatedTrashTonsMonthly / maxTrash, color: SERIES_COLORS[i] })) },
      { label: 'Compliance', values: selected.map((b, i) => {
        if (!policySet) return { name: b.name, value: 0, color: SERIES_COLORS[i] };
        const total = policySet.items.length;
        const gaps = countPolicyGaps(b.compliance, policySet);
        return { name: b.name, value: (total - gaps) / total, color: SERIES_COLORS[i] };
      }) },
      { label: 'Foot Traffic', values: selected.map((b, i) => ({ name: b.name, value: b.signals.footTrafficIndex, color: SERIES_COLORS[i] })) },
      { label: 'Vendor Prox.', values: selected.map((b, i) => ({ name: b.name, value: b.signals.proximityToVendorsIndex, color: SERIES_COLORS[i] })) },
      { label: 'River Prox.', values: selected.map((b, i) => ({ name: b.name, value: b.signals.riverProximityIndex, color: SERIES_COLORS[i] })) },
    ];
  }, [selected, beaches, policySet]);

  // Policy gap breakdown by category
  const gapBreakdown = useMemo(() => {
    if (!policySet || selected.length < 2) return null;
    return selected.map(beach => {
      const cats: Record<string, number> = {};
      for (const cat of POLICY_CATEGORIES) {
        const catItems = policySet.items.filter(pi => pi.category === cat);
        const missing = catItems.filter(pi => (beach.compliance.itemScores[pi.id] ?? 0) < 0.6).length;
        cats[cat] = missing;
      }
      return { beach, cats, total: Object.values(cats).reduce((s, v) => s + v, 0) };
    });
  }, [selected, policySet]);

  // Most common missing category across selected
  const topMissingCategory = useMemo(() => {
    if (!gapBreakdown) return null;
    const totals: Record<string, number> = {};
    for (const bd of gapBreakdown) {
      for (const [cat, count] of Object.entries(bd.cats)) {
        totals[cat] = (totals[cat] ?? 0) + count;
      }
    }
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[1] > 0 ? sorted[0][0] : null;
  }, [gapBreakdown]);

  // What's working elsewhere
  const workingElsewhere = useMemo(() => {
    const improving = selected.filter(b => b.supportStatus === 'steady' || b.supportStatus === 'making_progress');
    if (improving.length === 0) return { tasks: [], summary: '' };

    const tasks = improving.flatMap(b =>
      b.interventions.flatMap(p => p.steps.filter(s => s.status === 'done').map(s => ({
        beachName: b.name,
        beachType: b.beachType,
        ...s,
      })))
    ).slice(0, 6);

    // Find which categories helped
    const helpedCategories = [...new Set(tasks.map(t => t.category))];
    const bestBeach = improving[0];
    const summary = bestBeach
      ? `Beaches similar to ${bestBeach.name} improved after focusing on ${helpedCategories.join(' and ')}.`
      : '';

    return { tasks, summary };
  }, [selected]);

  // Strategic recommendation
  const recommendation = useMemo(() => {
    if (selected.length < 2 || !policySet) return null;

    // Which beach to prioritize
    const priorityBeach = [...selected].sort((a, b) => b.pollutionScore - a.pollutionScore)[0];

    // District-wide most lacking category
    const districtGaps: Record<string, number> = {};
    for (const beach of selected) {
      for (const pi of policySet.items) {
        if ((beach.compliance.itemScores[pi.id] ?? 0) < 0.6) {
          districtGaps[pi.category] = (districtGaps[pi.category] ?? 0) + 1;
        }
      }
    }
    const topCat = Object.entries(districtGaps).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Monitoring';

    // Estimate impact if applied broadly
    let totalTrashImpact = 0;
    let totalScoreImpact = 0;
    for (const beach of selected) {
      const plan = beach.interventions[beach.interventions.length - 1] ?? generateSupportPlan(beach, policySet);
      const impact = computeProjectedImpact(beach, plan);
      totalTrashImpact += impact.trashReductionPct30d;
      totalScoreImpact += impact.scoreImprovement30d;
    }

    return {
      priorityBeach,
      topCategory: topCat,
      avgTrashReduction: Math.round(totalTrashImpact / selected.length),
      avgScoreImprovement: Math.round(totalScoreImpact / selected.length),
    };
  }, [selected, policySet]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Compare Beaches</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Select 2–4 beaches to compare side by side</p>
      </div>

      {/* Beach Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {beaches.map(b => {
          const isSelected = selectedIds.includes(b.id);
          const gaps = policySet ? countPolicyGaps(b.compliance, policySet) : 0;
          return (
            <motion.button
              key={b.id}
              onClick={() => toggle(b.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'var(--shadow)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{b.mascot.emoji}</span>
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{b.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_PILL[b.supportStatus]}`}>
                  {STATUS_LABEL[b.supportStatus]}
                </span>
                <span className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{b.pollutionScore}</span>
                {gaps > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    {gaps}g
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Floating Comparison Tray */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="sticky top-16 z-30 rounded-2xl p-3 flex items-center gap-3 flex-wrap"
            style={{
              background: 'var(--bg-nav)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Comparing:</span>
            {selected.map(b => (
              <motion.button
                key={b.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => toggle(b.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {b.mascot.emoji} {b.name} <span style={{ color: 'var(--text-muted)' }}>×</span>
              </motion.button>
            ))}
            {selectedIds.length < 2 && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Select at least 2 beaches</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {sharedType && (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            Similar Type: {getBeachTypeLabel(sharedType)}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>Insights are more relevant for similar beaches</span>
        </div>
      )}

      {/* Main Compare Content */}
      <AnimatePresence mode="wait">
        {selected.length >= 2 && (
          <motion.div
            key="compare-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            {/* Radar Chart + Legend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <h3 className="text-xs font-semibold uppercase mb-3 self-start" style={{ color: 'var(--text-muted)' }}>
                  Multi-Metric Comparison
                </h3>
                <RadarChart axes={radarAxes} size={260} />
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {selected.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: SERIES_COLORS[i] }} />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>{b.mascot.emoji} {b.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Gap Stacked Bars */}
              {gapBreakdown && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                  <h3 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                    Policy Gap Breakdown
                  </h3>
                  <div className="space-y-3">
                    {gapBreakdown.map(({ beach, cats, total }) => (
                      <div key={beach.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{beach.mascot.emoji} {beach.name}</span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{total} gaps</span>
                        </div>
                        <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'var(--bg)' }}>
                          {total > 0 && POLICY_CATEGORIES.map(cat => {
                            const count = cats[cat] ?? 0;
                            if (count === 0) return null;
                            const pct = (count / Math.max(total, 1)) * 100;
                            return (
                              <div
                                key={cat}
                                title={`${cat}: ${count}`}
                                className="h-full transition-all"
                                style={{ width: `${pct}%`, background: CAT_COLORS[cat], opacity: 0.7 }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {POLICY_CATEGORIES.map(cat => (
                      <div key={cat} className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[cat], opacity: 0.7 }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cat}</span>
                      </div>
                    ))}
                  </div>
                  {topMissingCategory && (
                    <p className="text-[10px] mt-2 italic" style={{ color: 'var(--text-muted)' }}>
                      Most common gap: <strong>{topMissingCategory}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Beach Detail Cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(selected.length, 4)}, 1fr)` }}>
              {selected.map((beach, bi) => {
                const gaps = policySet ? countPolicyGaps(beach.compliance, policySet) : 0;
                const latestPlan = beach.interventions[beach.interventions.length - 1];

                return (
                  <motion.div
                    key={beach.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl p-5 space-y-3"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderTop: `3px solid ${SERIES_COLORS[bi]}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{beach.mascot.emoji}</span>
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{beach.name}</h3>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{getBeachTypeLabel(beach.beachType)}</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{beach.pollutionScore}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {STATUS_LABEL[beach.supportStatus]} · {beach.estimatedTrashTonsMonthly} t/mo
                    </div>
                    <div className="flex items-center gap-2">
                      {gaps > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-medium">
                          {gaps} policy gap{gaps !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium">
                          Compliant
                        </span>
                      )}
                    </div>
                    <MiniChart data={beach.history.map(h => h.pollutionScore)} width={200} height={50} />

                    {latestPlan && (
                      <div className="rounded-lg p-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Projected 30d</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                          -{latestPlan.projectedImpact.trashReductionPct30d}% trash · -{latestPlan.projectedImpact.scoreImprovement30d}pts
                        </p>
                      </div>
                    )}

                    {beach.interventions.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Completed Steps</p>
                        {beach.interventions[beach.interventions.length - 1].steps.filter(s => s.status === 'done').slice(0, 3).map(s => (
                          <p key={s.id} className="text-xs flex items-center gap-1" style={{ color: 'var(--text)' }}>
                            <span className="text-emerald-500">✓</span> {s.title}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* What's Working Elsewhere */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>What's Working Elsewhere</h3>
              {workingElsewhere.tasks.length > 0 ? (
                <>
                  {workingElsewhere.summary && (
                    <p className="text-xs mb-3 px-3 py-2 rounded-xl italic" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {workingElsewhere.summary}
                    </p>
                  )}
                  <ul className="space-y-1.5">
                    {workingElsewhere.tasks.map(t => (
                      <li key={t.id} className="text-xs flex items-start gap-2" style={{ color: 'var(--text)' }}>
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span><strong>{t.beachName}</strong>: {t.title} <span style={{ color: 'var(--text-muted)' }}>({t.ownerRole})</span></span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Complete support plan steps and run progress checks to generate cross-beach insights.
                </p>
              )}
            </div>

            {/* Strategic Recommendation */}
            {recommendation && (
              <div className="rounded-2xl p-5" style={{
                background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(167,139,250,0.08))',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Strategic Recommendation</h3>
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: 'var(--text)' }}>
                    <strong>Prioritize:</strong> {recommendation.priorityBeach.mascot.emoji} {recommendation.priorityBeach.name} (score {recommendation.priorityBeach.pollutionScore}) needs the most attention.
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text)' }}>
                    <strong>Focus area:</strong> <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: CAT_COLORS[recommendation.topCategory] ?? 'var(--accent)', color: 'white' }}>{recommendation.topCategory}</span> is the most lacking category across these beaches.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3 rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>-{recommendation.avgTrashReduction}%</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg trash reduction if plans applied</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent2)' }}>-{recommendation.avgScoreImprovement}pts</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg score improvement across beaches</div>
                    </div>
                  </div>
                  <p className="text-[10px] italic mt-2" style={{ color: 'var(--text-muted)' }}>
                    Addressing {recommendation.topCategory} across all selected beaches could yield the highest district-wide improvement.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
