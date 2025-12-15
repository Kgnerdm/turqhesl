import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { PageLoading } from '@/components/ui';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const ProvidersPage = lazy(() => import('@/pages/public/ProvidersPage'));
const ProviderDetailPage = lazy(() => import('@/pages/public/ProviderDetailPage'));
const PackagesPage = lazy(() => import('@/pages/public/PackagesPage'));
const PackageDetailPage = lazy(() => import('@/pages/public/PackageDetailPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// Dashboard pages
const PatientDashboard = lazy(() => import('@/pages/dashboard/patient/PatientDashboard'));
const ProviderDashboard = lazy(() => import('@/pages/dashboard/provider/ProviderDashboard'));
const PackageManagement = lazy(() => import('@/pages/dashboard/provider/PackageManagement'));
const BookingManagement = lazy(() => import('@/pages/dashboard/provider/BookingManagement'));
const ProviderProfilePage = lazy(() => import('@/pages/dashboard/provider/ProviderProfilePage'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/admin/AdminDashboard'));

// Profile page
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));

/**
 * Suspense wrapper for lazy loaded components
 */
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

/**
 * Main application routes
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <LazyPage>
              <HomePage />
            </LazyPage>
          }
        />
        <Route
          path="providers"
          element={
            <LazyPage>
              <ProvidersPage />
            </LazyPage>
          }
        />
        <Route
          path="providers/:id"
          element={
            <LazyPage>
              <ProviderDetailPage />
            </LazyPage>
          }
        />
        <Route
          path="packages"
          element={
            <LazyPage>
              <PackagesPage />
            </LazyPage>
          }
        />
        <Route
          path="packages/:id"
          element={
            <LazyPage>
              <PackageDetailPage />
            </LazyPage>
          }
        />
      </Route>

      {/* Auth routes (guest only) */}
      <Route element={<MainLayout hideFooter />}>
        <Route
          path="auth/login"
          element={
            <GuestRoute>
              <LazyPage>
                <LoginPage />
              </LazyPage>
            </GuestRoute>
          }
        />
        <Route
          path="auth/register"
          element={
            <GuestRoute>
              <LazyPage>
                <RegisterPage />
              </LazyPage>
            </GuestRoute>
          }
        />
      </Route>

      {/* Dashboard redirect based on role */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Profile route (for all authenticated users) */}
      <Route element={<MainLayout />}>
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Patient dashboard routes */}
      <Route element={<MainLayout hideFooter />}>
        <Route
          path="dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <LazyPage>
                <PatientDashboard />
              </LazyPage>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Provider dashboard routes */}
      <Route element={<MainLayout hideFooter />}>
        <Route
          path="dashboard/provider"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <LazyPage>
                <ProviderDashboard />
              </LazyPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/provider/packages"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <LazyPage>
                <PackageManagement />
              </LazyPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/provider/bookings"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <LazyPage>
                <BookingManagement />
              </LazyPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/provider/profile"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <LazyPage>
                <ProviderProfilePage />
              </LazyPage>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin dashboard routes */}
      <Route element={<MainLayout hideFooter />}>
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LazyPage>
                <AdminDashboard />
              </LazyPage>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 - Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Redirect to appropriate dashboard based on user role
 */
import { useAuth } from '@/contexts/AuthContext';

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'provider':
      return <Navigate to="/dashboard/provider" replace />;
    case 'patient':
    default:
      return <Navigate to="/dashboard/patient" replace />;
  }
};

export default AppRoutes;

