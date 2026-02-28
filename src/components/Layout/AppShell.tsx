import { useState, useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from '../Theme/ThemeToggle';
import SplashScreen from './SplashScreen';

interface Props {
  districtName: string;
  city: string;
  userName: string;
  onLogout: () => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/missions', label: 'Missions' },
];

export default function AppShell({ districtName, city, userName, onLogout, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
      setTimeout(() => setLoading(false), 700);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <SplashScreen visible={splashVisible} />}
      <div className={`min-h-screen transition-opacity duration-500 ${splashVisible ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'var(--bg)' }}>
        <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'var(--bg-nav)', borderColor: 'var(--border)' }}>
          <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavLink to="/home" className="flex items-center gap-2">
                <span className="text-2xl">🌊</span>
                <div className="hidden sm:block">
                  <span className="text-base font-bold" style={{ color: 'var(--text)' }}>Onda Intelligence</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{districtName}, {city}</span>
                </div>
              </NavLink>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'font-medium' : ''}`}
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="ml-2 pl-2 flex items-center gap-2" style={{ borderLeft: '1px solid var(--border)' }}>
                <ThemeToggle />
                <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{userName}</span>
                <button onClick={onLogout} className="px-2 py-1 text-xs rounded-lg transition-colors hover:text-rose-500" style={{ color: 'var(--text-muted)' }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-[1400px] mx-auto px-4 py-4">
          {children}
        </main>
      </div>
    </>
  );
}
