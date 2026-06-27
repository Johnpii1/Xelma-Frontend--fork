import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import PageSkeleton from './components/PageSkeleton';
import Landing from './pages/Landing';
import RouteFallback from './components/RouteFallback';
import LazyBoundary from './components/LazyBoundary';
import ErrorBoundary from './components/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner';
import Footer from './components/Footer';

const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'));
const LegacyDashboard = lazy(() => import(/* webpackChunkName: "legacy-dashboard" */ './pages/LegacyDashboard'));
const Leaderboard = lazy(() => import(/* webpackChunkName: "leaderboard" */ './components/Leaderboard'));
const LearnPage = lazy(() => import(/* webpackChunkName: "learn" */ './pages/Learn'));
const Connect = lazy(() => import('./pages/Connect'));
const Profile = lazy(() => import('./pages/Profile'));
const Pools = lazy(() => import('./pages/Pools'));

function App() {
  const { pathname } = useLocation();
  // Landing renders its own Footer at the bottom of its bespoke layout.
  // All other routes share the global session footer for consistent branding.
  const showGlobalFooter = pathname !== '/';

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0F1A] font-sans text-[#F3F4F6]">
      <OfflineBanner />
      <Navbar />
      <ErrorBoundary>
        <LazyBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Suspense fallback={<PageSkeleton type="dashboard" />}><Dashboard /></Suspense>} />
              <Route path="/play" element={<Suspense fallback={<PageSkeleton type="legacy" />}><LegacyDashboard /></Suspense>} />
              <Route path="/leaderboard" element={<Suspense fallback={<PageSkeleton type="leaderboard" />}><Leaderboard /></Suspense>} />
              <Route path="/learn" element={<Suspense fallback={<PageSkeleton type="learn" />}><LearnPage /></Suspense>} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/pools" element={<Pools />} />
              <Route
                path="/tournament"
                element={
                  <div className="xelma-grid-bg px-4 py-20 text-center text-xl font-bold text-gray-500">
                    Tournament — Coming Soon
                  </div>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </LazyBoundary>
      </ErrorBoundary>
      {showGlobalFooter && <Footer />}
      <Toaster richColors position="top-center" theme="dark" />
    </div>
  );
}

export default App;
