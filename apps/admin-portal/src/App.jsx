import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/UI/ScrollToTop';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import InvoicePrint from './pages/InvoicePrint';
import Technicians from './pages/Technicians';
import CalendarPage from './pages/Calendar';
import Customers from './pages/Customers';
import IncomingJobs from './pages/IncomingJobs';
import { useAuth } from './context/AuthProvider';

// robust auth gate: never renders “nothing”
function RequireAuth() {
  const { token } = useAuth();
  if (token === undefined) {
    return <div className="min-h-screen bg-[#000154] text-white grid place-items-center">Loading…</div>;
  }
  return token ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id/print" element={<InvoicePrint />} />
          <Route path="/techs" element={<Technicians />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/incoming-jobs" element={<IncomingJobs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
