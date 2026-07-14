import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const AddTransactionPage = lazy(() => import('@/pages/AddTransactionPage'));
const EditTransactionPage = lazy(() => import('@/pages/EditTransactionPage'));
const MonthlySummaryPage = lazy(() => import('@/pages/MonthlySummaryPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <SuspenseWrapper>
        <AuthCallbackPage />
      </SuspenseWrapper>
    ),
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/transactions',
        element: (
          <SuspenseWrapper>
            <TransactionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/transactions/new',
        element: (
          <SuspenseWrapper>
            <AddTransactionPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/transactions/:id/edit',
        element: (
          <SuspenseWrapper>
            <EditTransactionPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/monthly-summary',
        element: (
          <SuspenseWrapper>
            <MonthlySummaryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/categories',
        element: (
          <SuspenseWrapper>
            <CategoriesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/profile',
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
];
