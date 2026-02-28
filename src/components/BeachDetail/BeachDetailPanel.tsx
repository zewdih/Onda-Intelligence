import { motion } from 'framer-motion';
import type { Beach, TaskStatus, PolicySet } from '../../types/domain';
import type { DomainStore } from '../../state/useDomainStore';
import { STATUS_LABEL } from '../../utils/planEngine';
import { countPolicyGaps, computePolicyGaps } from '../../utils/policyGapEngine';
import SpeechBubble from './SpeechBubble';
import MiniChart from '../Dashboard/MiniChart';

interface Props {
  beach: Beach;
  store: DomainStore;
  policySet?: PolicySet;
  onClose: () => void;
}

const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
};

const STATUS_PILL: Record<string, string> = {
  needs_assistance: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  making_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  steady: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-rose-500 dark:text-rose-400',
};

export default function BeachDetailPanel({ beach, store, policySet, onClose }: Props) {
  const latestPlan = beach.interventions[beach.interventions.length - 1];
  const scores = beach.history.map(h => h.pollutionScore);
  const completionPct = latestPlan
    ? Math.round((latestPlan.steps.filter(s => s.status === 'done').length / latestPlan.steps.length) * 100)
    : 0;

  const gapCount = policySet ? countPolicyGaps(beach.compliance, policySet) : 0;
  const gaps = policySet
    ? computePolicyGaps(beach.compliance, policySet, beach.signals, beach.beachType)
    : null;

  const topMissingItems = gaps && policySet
    ? gaps.highestPriorityItemIds.slice(0, 3).map(id => policySet.items.find(pi => pi.id === id)).filter(Boolean)
    : [];

  const handleCycle = (planId: string, stepId: string, current: TaskStatus) => {
    const idx = STATUS_CYCLE.indexOf(current);
    store.updateStepStatus(beach.id, planId, stepId, STATUS_CYCLE[(idx + 1) % 3]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full overflow-y-auto rounded-2xl p-5 space-y-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{beach.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[beach.supportStatus]}`}>
              {STATUS_LABEL[beach.supportStatus]}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Updated {beach.lastUpdatedISO}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
          aria-label="Close panel"
        >×</button>
      </div>

      {/* Speech bubble */}
      <SpeechBubble beach={beach} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{beach.pollutionScore}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Pollution Score</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{beach.estimatedTrashTonsMonthly}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tons/Month</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>History</h3>
        <MiniChart data={scores} width={300} height={70} />
      </div>

      {/* Policy Support */}
      {policySet && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Policy Support</h3>
            {gapCount > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-medium">
                {gapCount} gap{gapCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium">
                Compliant
              </span>
            )}
          </div>
          {topMissingItems.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Top Missing Items</p>
              {topMissingItems.map(item => item && (
                <div key={item.id} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text)' }}>
                  <span className="text-rose-400 mt-0.5 flex-shrink-0">!</span>
                  <div>
                    <span className="font-medium">{item.title}</span>
                    <span className="ml-1.5 text-[10px] px-1.5 py-0 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              All policy requirements met — excellent stewardship!
            </p>
          )}
          {gaps && gaps.notes.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {gaps.notes.map((note, i) => (
                <p key={i} className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>{note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Support Plan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Support Plan</h3>
          <button
            onClick={() => store.generatePlan(beach.id)}
            className="px-3 py-1 text-xs font-medium rounded-lg transition-colors"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {latestPlan ? 'New Plan' : 'Generate Support Plan'}
          </button>
        </div>

        {latestPlan ? (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{latestPlan.summary}</p>

            {/* Projected Impact */}
            <div className="rounded-xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(167,139,250,0.08))', border: '1px solid var(--border)' }}>
              <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Projected Impact in 30 Days
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    -{latestPlan.projectedImpact.trashReductionPct30d}%
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Trash Reduction</div>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: 'var(--accent2)' }}>
                    -{latestPlan.projectedImpact.scoreImprovement30d}pts
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Score Improvement</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                <span className={`text-[10px] font-semibold ${CONFIDENCE_COLORS[latestPlan.projectedImpact.confidence]}`}>
                  {latestPlan.projectedImpact.confidence.toUpperCase()}
                </span>
              </div>
              <div className="space-y-0.5">
                {latestPlan.projectedImpact.rationaleBullets.map((bullet, i) => (
                  <p key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>• {bullet}</p>
                ))}
              </div>
            </div>

            {/* Policy Gap Matchup */}
            {latestPlan.policyGapMatchup.missingPolicyItemIds.length > 0 && (
              <div className="rounded-xl p-3 mb-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <h4 className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Policy Gap Coverage
                </h4>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {latestPlan.policyGapMatchup.missingPolicyItemIds.length} policy gaps identified · {latestPlan.policyGapMatchup.highestPriorityItemIds.length} high priority
                </p>
                {latestPlan.policyGapMatchup.notes.map((note, i) => (
                  <p key={i} className="text-[10px] mt-1 italic" style={{ color: 'var(--text-muted)' }}>
                    {note}
                  </p>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress: {completionPct}%</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, background: 'var(--accent)' }} />
              </div>
            </div>

            {/* Steps checklist */}
            <div className="space-y-1.5">
              {latestPlan.steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => handleCycle(latestPlan.id, step.id, step.status)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                    step.status === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' :
                    step.status === 'in_progress' ? 'border-amber-400' : ''
                  }`} style={step.status === 'todo' ? { borderColor: 'var(--border)' } : undefined}>
                    {step.status === 'done' && '✓'}
                    {step.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${step.status === 'done' ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--text)' }}>
                      {step.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{step.ownerRole}</span>
                      <span className={`text-[10px] px-1.5 py-0 rounded-full ${IMPACT_COLORS[step.expectedImpact]}`}>{step.expectedImpact}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{STATUS_LABELS[step.status]}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Citations */}
            {latestPlan.citations.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <h4 className="text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Policy References
                </h4>
                {latestPlan.citations.map((cite, i) => (
                  <a
                    key={i}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] mb-1 hover:underline truncate"
                    style={{ color: 'var(--accent)' }}
                  >
                    {cite.label}
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No plan yet. Generate one to see projected impact and recommended actions.
          </p>
        )}
      </div>

      {/* Reassess */}
      <button
        onClick={() => store.reassess(beach.id)}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: 'var(--accent2)', color: 'white' }}
      >
        Progress Check
      </button>
      <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
        Simulates time passing — score and compliance update based on completed steps
      </p>
    </motion.div>
  );
}
