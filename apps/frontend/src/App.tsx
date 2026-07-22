import { Navigate, Route, Routes } from 'react-router';
import { AdminRoute, LineUserRoute } from './contexts/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { Budget } from './pages/Budget';
import { Categories } from './pages/Categories';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Recurring } from './pages/Recurring';
import { AuthCallback } from './pages/AuthCallback';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route
        element={
          <LineUserRoute>
            <RootLayout />
          </LineUserRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="budget" element={<Budget />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
