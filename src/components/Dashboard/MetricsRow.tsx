import { motion } from 'framer-motion';

interface MetricItem {
  label: string;
  value: string;
  color?: string;
}

export default function MetricsRow({ items }: { items: MetricItem[] }) {
  const cols = Math.min(items.length, 6);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i }}
          className="rounded-2xl p-4 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="text-2xl font-bold" style={{ color: item.color ?? 'var(--text)' }}>{item.value}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
