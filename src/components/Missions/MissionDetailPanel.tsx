import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Mission } from '../../types/mission';
import { getHighestPlasticZone } from '../../utils/missionCalculator';
import { analyzeMissionShoreline, type SegmentMetrics } from '../../utils/shorelineAnalytics';
import ResourceCalculator from './ResourceCalculator';

const STATUS_STYLE: Record<string, string> = {
  ONGOING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  UPCOMING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const CATEGORY_DOT: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-orange-500',
  green: 'bg-emerald-500',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

interface Props {
  mission: Mission;
  onClose: () => void;
}

export default function MissionDetailPanel({ mission, onClose }: Props) {
  const highZone = getHighestPlasticZone(mission.zones);

  const analysis = useMemo(() => {
    if (mission.shoreline.length < 2) return null;
    return analyzeMissionShoreline(
      mission.shoreline,
      mission.heatmapPoints,
      mission.estimatedPlasticTons,
      10,
    );
  }, [mission]);

  const topSegments = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.segments].sort((a, b) => b.weightKgPerM2 - a.weightKgPerM2).slice(0, 3);
  }, [analysis]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full overflow-y-auto rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{mission.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[mission.status]}`}>
              {mission.status}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{mission.location.name}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
          aria-label="Close panel"
        >×</button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{mission.estimatedPlasticTons}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Tons</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{fmtNum(mission.estimatedItems)}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Items</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{mission.zones.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Zones</div>
        </div>
      </div>

      {/* Visible / Buried breakdown */}
      {analysis && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Waste Breakdown</h3>
          <div className="flex gap-3 text-xs">
            <div className="flex-1">
              <div className="font-bold" style={{ color: 'var(--text)' }}>{analysis.corrected.visibleTons}t</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Visible (40%)</div>
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{ color: 'var(--text)' }}>{analysis.corrected.buriedTons}t</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Buried (60%)</div>
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{ color: 'var(--accent)' }}>{analysis.corrected.correctedTotalTons}t</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Corrected Total</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-l-full" style={{ width: '40%', background: 'var(--accent)' }} />
            <div className="h-full rounded-r-full" style={{ width: '60%', background: 'var(--text-muted)', opacity: 0.4 }} />
          </div>
        </div>
      )}

      {/* Date range */}
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="font-medium">Dates: </span>
        <span style={{ color: 'var(--text)' }}>
          {fmtDate(mission.startDate)}{mission.endDate ? ` – ${fmtDate(mission.endDate)}` : ' – TBD'}
        </span>
      </div>

      {/* Highest plastic zone */}
      {highZone && (
        <div className="rounded-xl p-3 flex items-center gap-3" style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.18)',
        }}>
          <span className="text-lg">🔴</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              Highest concentration: {highZone.name}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              ~{highZone.estimatedTons} tons estimated
            </p>
          </div>
        </div>
      )}

      {/* Segment density */}
      {topSegments.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Shoreline Density</h3>
          <div className="space-y-1.5">
            {topSegments.map((seg: SegmentMetrics) => (
              <div
                key={seg.index}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[seg.category]}`} />
                <span className="font-medium flex-1" style={{ color: 'var(--text)' }}>Segment {seg.index + 1}</span>
                <span style={{ color: 'var(--text-muted)' }}>{seg.weightKgPerM2} kg/m²</span>
                <span style={{ color: 'var(--text-muted)' }}>{seg.personHours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone breakdown */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Zones</h3>
        <div className="space-y-1.5">
          {mission.zones.map(z => (
            <div
              key={z.id}
              className="flex items-center justify-between p-2.5 rounded-xl text-xs"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <span className="font-medium" style={{ color: 'var(--text)' }}>{z.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>~{z.estimatedTons}t</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Calculator */}
      <ResourceCalculator
        defaultTons={mission.estimatedPlasticTons}
        startDate={mission.startDate}
        endDate={mission.endDate}
      />
    </motion.div>
  );
}
