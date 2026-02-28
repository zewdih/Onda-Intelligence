import { motion } from 'framer-motion';
import type { Mission } from '../../types/mission';

const STATUS_STYLE: Record<string, string> = {
  ONGOING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  UPCOMING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  mission: Mission;
  onClick: () => void;
}

export default function MissionCard({ mission, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className="w-full text-left rounded-2xl p-4 transition-shadow"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {mission.name}
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_STYLE[mission.status]}`}>
          {mission.status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <span>{mission.location.name}</span>
        <span>·</span>
        <span>{fmtDate(mission.startDate)}{mission.endDate ? ` – ${fmtDate(mission.endDate)}` : ''}</span>
      </div>
      <div className="mt-2 text-xs font-medium" style={{ color: 'var(--accent)' }}>
        ~{mission.estimatedPlasticTons} tons estimated
      </div>
    </motion.button>
  );
}
