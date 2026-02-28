import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STEPS = [
  { emoji: '🔍', label: 'Assess', desc: 'Monitor beach conditions and pollution data' },
  { emoji: '📋', label: 'Plan', desc: 'Generate policy-aligned intervention plans' },
  { emoji: '⚡', label: 'Execute', desc: 'Track tasks across city teams and roles' },
  { emoji: '✓', label: 'Verify', desc: 'Run progress checks to measure impact' },
  { emoji: '📈', label: 'Improve', desc: 'Learn what works and close policy gaps' },
  { emoji: '🔗', label: 'Share', desc: 'Compare districts to spread best practices' },
];

const FEATURES = [
  { emoji: '🎯', title: 'Policy Gap Analysis', desc: 'Identify which policy requirements are missing at each beach and prioritize by severity.' },
  { emoji: '📊', title: 'Projected Impact', desc: 'See estimated trash reduction and score improvement before committing to a plan.' },
  { emoji: '📝', title: 'Actionable Checklists', desc: 'Role-based tasks aligned to policy items, with status tracking and owner assignment.' },
  { emoji: '🔗', title: 'Policy References', desc: 'Every recommendation links back to the relevant policy section for transparency.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 pb-12">
      <section className="text-center pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-4">🌊</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Onda Intelligence</h1>
          <p className="text-lg mt-4 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Supportive tools for district admins to monitor, plan, and improve coastal health — aligned to local policy.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => navigate('/app')} className="px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-colors" style={{ background: 'var(--accent)' }}>
            Open Dashboard
          </button>
          <button onClick={() => navigate('/compare')} className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            Compare Beaches
          </button>
        </motion.div>
      </section>

      <section>
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="relative rounded-2xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-2">{s.emoji}</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{s.label}</h3>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              {i < STEPS.length - 1 && <span className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'var(--border)' }}>›</span>}
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
              className="rounded-2xl p-5 flex items-start gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-2xl flex-shrink-0">{f.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Hackathon Track</p>
        <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Built for Ocean Cleanup & Coastal Operations</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Supportive district-level tools. No blame — just progress.</p>
      </section>
    </div>
  );
}
