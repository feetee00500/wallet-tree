import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AdminRoute, LineUserRoute } from './contexts/AuthContext';

const RootLayout = lazy(() => import('./layouts/RootLayout').then((module) => ({ default: module.RootLayout })));
const Budget = lazy(() => import('./pages/Budget').then((module) => ({ default: module.Budget })));
const Categories = lazy(() => import('./pages/Categories').then((module) => ({ default: module.Categories })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Recurring = lazy(() => import('./pages/Recurring').then((module) => ({ default: module.Recurring })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then((module) => ({ default: module.AuthCallback })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then((module) => ({ default: module.AdminUsers })));
const AdminAccount = lazy(() => import('./pages/AdminAccount').then((module) => ({ default: module.AdminAccount })));
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const Transactions = lazy(() => import('./pages/Transactions').then((module) => ({ default: module.Transactions })));

export function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas-soft text-body" role="status">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em]">Loading finance module…</span>
        </div>
      }
    >
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="account" element={<AdminAccount />} />
      </Route>
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
    </Suspense>
  );
}
