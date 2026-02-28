import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { District, AdminUser } from '../types/domain';
import type { MissionPriority } from '../types/mission';
import { getMissions, getPersonalStats, groupMissionsByPriority } from '../data/missions';
import MetricsRow from '../components/Dashboard/MetricsRow';

interface Props {
  user: AdminUser;
  district: District;
}

const PRIORITY_CONFIG: Record<MissionPriority, { label: string; accent: string; pill: string }> = {
  HIGH: {
    label: 'High Priority',
    accent: '#f87171',
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  MEDIUM: {
    label: 'Medium Priority',
    accent: '#fbbf24',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  LOW: {
    label: 'Low Priority',
    accent: '#38bdf8',
    pill: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
};

const STATUS_PILL: Record<string, string> = {
  ONGOING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  UPCOMING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminHome({ user, district }: Props) {
  const navigate = useNavigate();
  const missions = getMissions();
  const stats = getPersonalStats();
  const grouped = groupMissionsByPriority(missions);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-12">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(167,139,250,0.08) 50%, rgba(251,191,36,0.06) 100%)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Here's your expedition impact so far.
          </p>
          <p className="text-xs mt-2 px-3 py-1 rounded-full inline-block" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {district.name} · {district.city}
          </p>
          <button
            onClick={() => navigate('/missions')}
            className="mt-3 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-[1.03] flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(56,189,248,0.3)',
            }}
          >
            🚢 Plastic Odyssey Expeditions
          </button>
        </div>
      </motion.div>

      {/* Personal Expedition KPIs */}
      <motion.div variants={fadeUp}>
        <MetricsRow items={[
          { label: 'Waste Removed', value: `${stats.wasteRemovedTons}t` },
          { label: 'CO₂ Lowered', value: `${stats.carbonLoweredTonsCO2e}t CO₂e`, color: '#34d399' },
          { label: 'Wildlife Protected', value: `~${stats.wildlifeProtectedCount}`, color: '#38bdf8' },
          { label: 'Coastline Improved', value: `${stats.coastlineImprovedKm} km`, color: '#a78bfa' },
          { label: 'Expeditions Completed', value: String(stats.expeditionsCompleted), color: '#fbbf24' },
          { label: 'Hours Volunteered', value: String(stats.hoursVolunteered) },
        ]} />
      </motion.div>

      {/* Priority Attention — Mission groups */}
      <motion.div variants={fadeUp} className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Priority Attention
        </h2>

        {(['HIGH', 'MEDIUM', 'LOW'] as const).map(priority => {
          const group = grouped[priority];
          if (group.length === 0) return null;
          const cfg = PRIORITY_CONFIG[priority];

          return (
            <div key={priority} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: cfg.accent }} />
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: cfg.accent }}>
                  {cfg.label} ({group.length})
                </h3>
              </div>
              {group.map((mission, i) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    borderLeft: `3px solid ${cfg.accent}`,
                  }}
                >
                  <span className="text-3xl">🚢</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{mission.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[mission.status]}`}>
                        {mission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span>{mission.location.name}</span>
                      <span style={{ color: 'var(--text)' }}>
                        <strong>{mission.estimatedPlasticTons}t</strong> to remove
                      </span>
                      <span>
                        {fmtDate(mission.startDate)}{mission.endDate ? ` – ${fmtDate(mission.endDate)}` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/missions?selected=${mission.id}`)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl flex-shrink-0 transition-colors"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    View & Support
                  </button>
                </motion.div>
              ))}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
