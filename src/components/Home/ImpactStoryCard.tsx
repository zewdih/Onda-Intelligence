import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImpactEquivalents } from '../../utils/impactEquivalents';

interface Props {
  equiv: ImpactEquivalents;
}

const CONFIDENCE_STYLE: Record<string, string> = {
  high: 'text-emerald-500',
  medium: 'text-amber-500',
  low: 'text-rose-400',
};

interface TileProps {
  emoji: string;
  value: string;
  label: string;
  delay: number;
}

function EquivTile({ emoji, value, label, delay }: TileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl p-3 text-center"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="text-lg mb-0.5">{emoji}</div>
      <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>{value}</div>
      <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  );
}

export default function ImpactStoryCard({ equiv }: Props) {
  const [methodOpen, setMethodOpen] = useState(false);

  if (equiv.beachCount === 0) return null;

  const tiles = [
    { emoji: '🚛', value: String(equiv.pickupTruckLoads), label: 'Truck Loads Prevented' },
    { emoji: '🗑️', value: String(equiv.trashBags), label: 'Trash Bags Worth' },
    { emoji: '🙌', value: `${equiv.volunteerHoursSaved}h`, label: 'Volunteer Hours Saved' },
    { emoji: '🏈', value: String(equiv.footballFields), label: 'Football Fields Kept Clean' },
  ];

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(167,139,250,0.1))',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        Projected District Impact
      </h3>

      {/* Plain English Summary */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
        {equiv.plainEnglishSummary}
      </p>

      {/* Headline Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            -{equiv.trashReductionPct}%
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Trash Reduction</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent2)' }}>
            -{equiv.scorePtsImproved}pts
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Improvement</div>
        </div>
      </div>

      {/* Real-World Equivalent Tiles */}
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t, i) => (
          <EquivTile key={t.label} emoji={t.emoji} value={t.value} label={t.label} delay={0.05 * i} />
        ))}
      </div>

      {/* Wildlife Impact */}
      <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <span className="text-lg flex-shrink-0">🐢</span>
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>
            Wildlife Impact
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {equiv.wildlifeBlurb}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Confidence:</span>
        <span className={`text-[10px] font-semibold ${CONFIDENCE_STYLE[equiv.confidence] ?? 'text-rose-400'}`}>
          {equiv.confidence.toUpperCase()}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          · {equiv.beachCount} beach{equiv.beachCount !== 1 ? 'es' : ''} · 30-day projection
        </span>
      </div>

      {/* Expandable Methodology */}
      <button
        onClick={() => setMethodOpen(v => !v)}
        className="text-[10px] font-medium flex items-center gap-1 transition-colors"
        style={{ color: 'var(--accent)' }}
      >
        <span className="transition-transform inline-block" style={{ transform: methodOpen ? 'rotate(90deg)' : undefined }}>
          ▶
        </span>
        How we calculated this
      </button>
      <AnimatePresence>
        {methodOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-[10px] leading-relaxed p-3 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg)' }}>
              {equiv.methodologyNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
