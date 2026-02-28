import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Mission, MissionStatus } from '../../types/mission';

type Filter = 'ALL' | MissionStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Completed', value: 'COMPLETED' },
];

const STATUS_STYLE: Record<string, string> = {
  ONGOING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  UPCOMING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

interface Props {
  missions: Mission[];
  selectedId: string | null;
  onSelect: (mission: Mission) => void;
}

export default function MissionSidebar({ missions, selectedId, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const filtered = filter === 'ALL' ? missions : missions.filter(m => m.status === filter);

  return (
    <div
      className="h-full overflow-y-auto space-y-2 pr-1 rounded-2xl p-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
        Missions ({filtered.length})
      </h2>

      {/* Compact filter chips */}
      <div className="flex gap-1 flex-wrap mb-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors"
            style={{
              background: filter === f.value ? 'var(--accent)' : 'var(--bg)',
              color: filter === f.value ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${filter === f.value ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm p-4 text-center" style={{ color: 'var(--text-muted)' }}>No missions match this filter.</p>
      )}

      {filtered.map((mission, i) => (
        <motion.button
          key={mission.id}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i }}
          onClick={() => onSelect(mission)}
          className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === mission.id ? 'ring-2' : ''}`}
          style={{
            background: selectedId === mission.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: selectedId === mission.id ? '0 0 0 2px var(--accent)' : 'var(--shadow)',
          }}
          whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">🚢</span>
              <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{mission.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[mission.status]}`}>
              {mission.status}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>~{mission.estimatedPlasticTons}t</span>
          </div>
          <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{mission.location.name}</p>
        </motion.button>
      ))}
    </div>
  );
}
