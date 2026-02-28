import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { District, PolicyCategory } from '../types/domain';
import { useDomainStore } from '../state/useDomainStore';
import { computeProjectedImpact } from '../utils/impactModel';
import { generateSupportPlan, STATUS_LABEL } from '../utils/planEngine';
import { countPolicyGaps, computePolicyGaps } from '../utils/policyGapEngine';
import MetricsRow from '../components/Dashboard/MetricsRow';

interface Props {
  district: District;
}

const POLICY_CATEGORIES: PolicyCategory[] = ['Waste Infrastructure', 'Vendor Compliance', 'Community Programs', 'Enforcement', 'Monitoring'];

const CAT_COLORS: Record<string, string> = {
  'Waste Infrastructure': '#38bdf8',
  'Vendor Compliance': '#a78bfa',
  'Community Programs': '#fbbf24',
  'Enforcement': '#f87171',
  'Monitoring': '#34d399',
};

const CAT_EMOJI: Record<string, string> = {
  'Waste Infrastructure': '🗑️',
  'Vendor Compliance': '🏪',
  'Community Programs': '🤝',
  'Enforcement': '🛡️',
  'Monitoring': '📡',
};

const STATUS_PILL: Record<string, string> = {
  needs_assistance: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  making_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  steady: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function DistrictStrategy({ district }: Props) {
  const store = useDomainStore();

  useEffect(() => {
    store.initForDistrict(district.id);
  }, [district.id]);

  const beaches = store.beaches;
  const ps = store.policySet;

  // Aggregate policy gaps by category
  const categoryGaps = useMemo(() => {
    if (!ps) return [];
    const counts: Record<string, { total: number; highSev: number }> = {};
    for (const cat of POLICY_CATEGORIES) {
      counts[cat] = { total: 0, highSev: 0 };
    }
    for (const beach of beaches) {
      for (const pi of ps.items) {
        if ((beach.compliance.itemScores[pi.id] ?? 0) < 0.6) {
          counts[pi.category].total += 1;
          if (pi.severityIfMissing === 'high') counts[pi.category].highSev += 1;
        }
      }
    }
    return POLICY_CATEGORIES
      .map(cat => ({ category: cat, ...counts[cat] }))
      .sort((a, b) => b.total - a.total);
  }, [beaches, ps]);

  const topCategories = categoryGaps.slice(0, 3);
  const maxGaps = Math.max(...categoryGaps.map(c => c.total), 1);

  // 60-day district projection
  const projection = useMemo(() => {
    if (!ps || beaches.length === 0) return null;

    let totalTrashReduction = 0;
    let totalScoreImprovement = 0;
    let impactedBeaches = 0;

    for (const beach of beaches) {
      if (beach.supportStatus === 'steady') continue;
      impactedBeaches++;
      const plan = beach.interventions[beach.interventions.length - 1] ?? generateSupportPlan(beach, ps);
      const impact = computeProjectedImpact(beach, plan, 0.8); // 80% completion over 60d
      totalTrashReduction += impact.trashReductionPct30d * 1.4; // extrapolate to 60d
      totalScoreImprovement += impact.scoreImprovement30d * 1.3;
    }

    if (impactedBeaches === 0) return null;

    const totalTrash = beaches.reduce((s, b) => s + b.estimatedTrashTonsMonthly, 0);
    const impactTrash = beaches.filter(b => b.supportStatus !== 'steady').reduce((s, b) => s + b.estimatedTrashTonsMonthly, 0);
    const districtReduction = totalTrash > 0 ? Math.round((impactTrash * (totalTrashReduction / impactedBeaches / 100) / totalTrash) * 100) : 0;

    return {
      trashReductionPct: Math.max(8, Math.min(40, districtReduction)),
      avgScoreImprovement: Math.round(totalScoreImprovement / impactedBeaches),
      beachesImpacted: impactedBeaches,
      totalTrashTonsReduced: +(impactTrash * (totalTrashReduction / impactedBeaches / 100)).toFixed(1),
    };
  }, [beaches, ps]);

  // Beach breakdown for strategy
  const beachBreakdown = useMemo(() => {
    return [...beaches]
      .sort((a, b) => b.pollutionScore - a.pollutionScore)
      .map(beach => ({
        beach,
        gaps: ps ? countPolicyGaps(beach.compliance, ps) : 0,
        topMissing: ps ? computePolicyGaps(beach.compliance, ps, beach.signals, beach.beachType).highestPriorityItemIds.slice(0, 2).map(id => ps.items.find(p => p.id === id)?.category).filter(Boolean) : [],
      }));
  }, [beaches, ps]);

  // Friendly summary
  const summaryText = useMemo(() => {
    if (!projection || topCategories.length === 0) return '';
    const cats = topCategories.slice(0, 2).map(c => c.category).join(' and ');
    return `If the district focuses on ${cats} over the next 60 days, we project a ${projection.trashReductionPct}% reduction in overall beach waste and an average score improvement of ${projection.avgScoreImprovement} points across ${projection.beachesImpacted} beach${projection.beachesImpacted !== 1 ? 'es' : ''}.`;
  }, [projection, topCategories]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-12">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>District Strategy</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {district.name}, {district.city} — executive-level overview of policy gaps and projected outcomes
        </p>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={fadeUp}>
        <MetricsRow items={[
          { label: 'Total Beaches', value: String(beaches.length) },
          { label: 'Needs Assistance', value: String(beaches.filter(b => b.supportStatus === 'needs_assistance').length), color: '#f87171' },
          { label: 'Making Progress', value: String(beaches.filter(b => b.supportStatus === 'making_progress').length), color: '#fbbf24' },
          { label: 'Steady', value: String(beaches.filter(b => b.supportStatus === 'steady').length), color: '#34d399' },
        ]} />
      </motion.div>

      {/* Friendly Summary */}
      {summaryText && (
        <motion.div
          variants={fadeUp}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(167,139,250,0.1))',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            {summaryText}
          </p>
          <p className="text-[10px] mt-2 italic" style={{ color: 'var(--text-muted)' }}>
            Based on current compliance data and projected plan outcomes at 80% completion rate.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Policy Gap Distribution */}
        <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 className="text-xs font-semibold uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            Aggregated Policy Gaps by Category
          </h3>
          <div className="space-y-3">
            {categoryGaps.map(({ category, total, highSev }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{CAT_EMOJI[category]}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {highSev > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        {highSev} high
                      </span>
                    )}
                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{total}</span>
                  </div>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(total / maxGaps) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: CAT_COLORS[category], opacity: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 60-Day Projected Impact */}
        {projection && (
          <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}>
            <h3 className="text-xs font-semibold uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              60-Day Projected Impact
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>-{projection.trashReductionPct}%</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>District Trash Reduction</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--accent2)' }}>-{projection.avgScoreImprovement}pts</div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Avg Score Improvement</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{projection.beachesImpacted}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Beaches Impacted</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{projection.totalTrashTonsReduced}t</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Monthly Tons Reduced</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Top 3 Intervention Categories */}
      <motion.div variants={fadeUp}>
        <h3 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          Top Intervention Categories Needed
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topCategories.map(({ category, total, highSev }, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                borderLeft: `4px solid ${CAT_COLORS[category]}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{CAT_EMOJI[category]}</span>
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{category}</h4>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{total} gaps across {beaches.length} beaches</span>
                </div>
              </div>
              {highSev > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {highSev} high-severity {highSev === 1 ? 'gap requires' : 'gaps require'} immediate attention.
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Beach-by-Beach Breakdown */}
      <motion.div variants={fadeUp}>
        <h3 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          Beach-by-Beach Overview
        </h3>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {beachBreakdown.map(({ beach, gaps, topMissing }, i) => (
            <div
              key={beach.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)',
                borderBottom: i < beachBreakdown.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span className="text-lg">{beach.mascot.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{beach.name}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[beach.supportStatus]}`}>
                {STATUS_LABEL[beach.supportStatus]}
              </span>
              <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text)' }}>{beach.pollutionScore}</span>
              {gaps > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-medium w-12 text-center">
                  {gaps} gap{gaps !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium w-12 text-center">
                  OK
                </span>
              )}
              <div className="hidden md:flex gap-1">
                {topMissing.map(cat => (
                  <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: CAT_COLORS[cat as string] ?? 'var(--bg)', color: 'white', opacity: 0.8 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Policy Reference */}
      {ps && (
        <motion.div variants={fadeUp} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Policy Reference</h3>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ps.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ps.jurisdiction}</p>
          <a
            href={ps.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-2 inline-block hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View full policy document →
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
