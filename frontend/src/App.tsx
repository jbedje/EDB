import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { Skeleton } from './components/Skeleton';

// Public Pages (not lazy loaded for faster initial load)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout
import Layout from './components/Layout';

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cohorts = lazy(() => import('./pages/Cohorts'));
const Coaching = lazy(() => import('./pages/Coaching'));
const CoachingAdmin = lazy(() => import('./pages/CoachingAdmin'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Payments = lazy(() => import('./pages/Payments'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Plans = lazy(() => import('./pages/Plans'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Learner Pages (lazy loaded)
const AvailablePlans = lazy(() => import('./pages/AvailablePlans'));
const MyPayments = lazy(() => import('./pages/MyPayments'));

// Coach Pages (lazy loaded)
const MesCohortes = lazy(() => import('./pages/coach/MesCohortes'));
const Planning = lazy(() => import('./pages/coach/Planning'));
const SuiviApprenants = lazy(() => import('./pages/coach/SuiviApprenants'));
const RapportsCoach = lazy(() => import('./pages/coach/Rapports'));

/**
 * Loading fallback component
 */
const PageLoader = () => (
  <div className="p-6 space-y-6">
    <Skeleton variant="text" width="40%" height={32} />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>
    <Skeleton variant="rectangular" height={400} className="rounded-lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - Accessible by all authenticated users */}
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />

            {/* Common Routes */}
            <Route
              path="cohorts"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Cohorts />
                </Suspense>
              }
            />
            <Route
              path="coaching"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Coaching />
                </Suspense>
              }
            />
            <Route
              path="subscriptions"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Subscriptions />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="coaching-admin"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CoachingAdmin />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="payments"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Payments />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Users />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Reports />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Notifications />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="plans"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Plans />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* Learner Routes */}
            <Route
              path="available-plans"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['APPRENANT']}>
                    <AvailablePlans />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="my-payments"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['APPRENANT']}>
                    <MyPayments />
                  </ProtectedRoute>
                </Suspense>
              }
            />

            {/* Coach Routes */}
            <Route
              path="mes-cohortes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['COACH']}>
                    <MesCohortes />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="planning"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['COACH']}>
                    <Planning />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="suivi-apprenants"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['COACH']}>
                    <SuiviApprenants />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="rapports-coach"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute allowedRoles={['COACH']}>
                    <RapportsCoach />
                  </ProtectedRoute>
                </Suspense>
              }
            />
          </Route>

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
