import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './state/useSession';
import { applyThemeClass, getStoredTheme } from './utils/theme';
import Login from './routes/Login';
import Home from './routes/Home';
import AdminHome from './routes/AdminHome';
import AppDashboard from './routes/AppDashboard';
import AppShell from './components/Layout/AppShell';
import { useEffect } from 'react';

export default function App() {
  const { session, login, logout } = useSession();

  useEffect(() => {
    applyThemeClass(getStoredTheme());
  }, []);

  if (!session) {
    return (
      <BrowserRouter>
        <Login onLogin={login} />
      </BrowserRouter>
    );
  }

  const { user, district } = session;

  return (
    <BrowserRouter>
      <AppShell
        districtName={district.name}
        city={district.city}
        userName={user.name}
        onLogout={logout}
      >
        <Routes>
          <Route path="/home" element={<AdminHome user={user} district={district} />} />
          <Route path="/missions" element={<AppDashboard />} />
          <Route path="/about" element={<Home />} />
          {/* Redirect old routes */}
          <Route path="/app" element={<Navigate to="/missions" replace />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
