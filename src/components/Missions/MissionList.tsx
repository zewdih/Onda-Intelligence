import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Mission, MissionStatus } from '../../types/mission';
import MissionCard from './MissionCard';

type Filter = 'ALL' | MissionStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Completed', value: 'COMPLETED' },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

interface Props {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
}

export default function MissionList({ missions, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const filtered = filter === 'ALL' ? missions : missions.filter(m => m.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
          Plastic Odyssey Missions
        </h2>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1 text-xs rounded-full font-medium transition-colors"
              style={{
                background: filter === f.value ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === f.value ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filter === f.value ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No missions match this filter.</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
          {filtered.map(m => (
            <motion.div key={m.id} variants={fadeUp}>
              <MissionCard mission={m} onClick={() => onSelect(m)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
