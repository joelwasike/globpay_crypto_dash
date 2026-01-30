import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import { useAuth } from 'contexts/AuthContext';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const TransactionsPage = Loadable(lazy(() => import('pages/transactions')));
const AnalyticsPage = Loadable(lazy(() => import('pages/analytics')));
const DepositsPage = Loadable(lazy(() => import('pages/deposits')));
const WithdrawalsPage = Loadable(lazy(() => import('pages/withdrawals')));
const ProfilePage = Loadable(lazy(() => import('pages/profile')));
const MerchantsPage = Loadable(lazy(() => import('pages/merchants')));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    { path: '/', element: <Navigate to="/dashboard/default" replace /> },
    { path: 'dashboard', children: [{ path: 'default', element: <DashboardDefault /> }] },
    { path: 'analytics', element: <AnalyticsPage /> },
    { path: 'transactions', element: <TransactionsPage /> },
    { path: 'deposits', element: <DepositsPage /> },
    { path: 'withdrawals', element: <WithdrawalsPage /> },
    { path: 'merchants', element: <MerchantsPage /> },
    { path: 'profile', element: <ProfilePage /> }
  ]
};

export default MainRoutes;
