import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { OfflineBanner } from './components/OfflineBanner';
import { LoginPage } from './pages/LoginPage';
import { DashboardHome } from './pages/DashboardHome';
import { EventsManager } from './pages/EventsManager';
import { ActivityEventsManager } from './pages/ActivityEventsManager';
import { CoreTeamManager } from './pages/CoreTeamManager';
import { MembershipResponsesManager } from './pages/MembershipResponsesManager';
import { CertificateManager } from './pages/CertificateManager';
import './styles/admin.css';

function RequireAuth() {
  const { isLoading, isVerified } = useAuth();

  if (isLoading) {
    return (
      <div className="login-bg">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <span className="brand-dot lg" style={{ display: 'block', margin: '0 auto 1rem' }} />
          <p className="login-sub">Verifying session…</p>
        </div>
      </div>
    );
  }

  return isVerified ? <Outlet /> : <Navigate to="/login" replace />;
}

function DashboardLayout() {
  return (
    <div className="app-layout">
      <OfflineBanner />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/events" element={<EventsManager />} />
            <Route path="/dashboard/activity-events" element={<ActivityEventsManager />} />
            <Route path="/dashboard/core-team" element={<CoreTeamManager />} />
            <Route path="/dashboard/membership" element={<MembershipResponsesManager />} />
            <Route path="/dashboard/certificates" element={<CertificateManager />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
