import { useState, useCallback } from 'react';
import type { AdminUser, District } from '../types/domain';

const SESSION_KEY = 'onda-session';

export interface Session {
  user: AdminUser;
  district: District;
}

function load(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate session has current schema fields
      if (!parsed?.district?.policySetId || !parsed?.user?.id) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('onda-domain-store');
        localStorage.removeItem('onda-activity');
        return null;
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function save(s: Session | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(load);

  const login = useCallback((user: AdminUser, district: District) => {
    const s: Session = { user, district };
    save(s);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
    save(null);
    setSession(null);
  }, []);

  return { session, login, logout };
}