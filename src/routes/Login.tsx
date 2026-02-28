import { useState } from 'react';
import { motion } from 'framer-motion';
import { loadAdmins, findAdmin, getDistrictById } from '../data/adapter';
import type { AdminUser, District } from '../types/domain';

interface Props {
  onLogin: (user: AdminUser, district: District) => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const admins = loadAdmins();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = findAdmin(email);
    if (!user) { setError('User not found. Try a demo account below.'); return; }
    if (!password) { setError('Enter any password to continue.'); return; }
    const district = getDistrictById(user.districtId);
    if (!district) { setError('District not found.'); return; }
    onLogin(user, district);
  };

  const handleQuick = (user: AdminUser) => {
    const district = getDistrictById(user.districtId);
    if (district) onLogin(user, district);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌊</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Onda Intelligence</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>District Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@onda.io"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Any password"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button type="submit" className="w-full px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors" style={{ background: 'var(--accent)' }}>
            Continue
          </button>
        </form>

        <div className="mt-6">
          <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Quick demo login</p>
          <div className="space-y-2">
            {admins.map(u => {
              const d = getDistrictById(u.districtId);
              return (
                <button key={u.id} onClick={() => handleQuick(u)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg)', color: 'var(--accent)' }}>
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d?.city} · {d?.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
