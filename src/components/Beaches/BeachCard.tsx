import { motion } from 'framer-motion';
import type { Beach, PolicySet } from '../../types/domain';
import { STATUS_LABEL } from '../../utils/planEngine';
import { countPolicyGaps } from '../../utils/policyGapEngine';

interface Props {
  beach: Beach;
  selected: boolean;
  onClick: () => void;
  policySet?: PolicySet;
  index: number;
}

const STATUS_PILL: Record<string, string> = {
  needs_assistance: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  making_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  steady: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

export default function BeachCard({ beach, selected, onClick, policySet, index }: Props) {
  const gaps = policySet ? countPolicyGaps(beach.compliance, policySet) : 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all ${selected ? 'ring-2' : ''}`}
      style={{
        background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: selected ? '0 0 0 2px var(--accent)' : 'var(--shadow)',
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{beach.mascot.emoji}</span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{beach.name}</h4>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{beach.mascot.label}</span>
          </div>
        </div>
        <div className="text-lg font-bold flex-shrink-0 ml-2" style={{ color: 'var(--text)' }}>
          {beach.pollutionScore}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[beach.supportStatus]}`}>
          {STATUS_LABEL[beach.supportStatus]}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{beach.estimatedTrashTonsMonthly} t/mo</span>
        {gaps > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-medium">
            {gaps} gap{gaps !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.button>
  );
}
