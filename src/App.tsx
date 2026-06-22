import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LegacyDashboard from './pages/LegacyDashboard';
import Leaderboard from './components/Leaderboard';
import LearnPage from './pages/Learn';
import Connect from './pages/Connect';

function App() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] font-sans text-[#F3F4F6]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/play" element={<LegacyDashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/connect" element={<Connect />} />
        <Route
          path="/pools"
          element={
            <div className="xelma-grid-bg px-4 py-20 text-center text-xl font-bold text-gray-500">
              Pools — Coming Soon
            </div>
          }
        />
        <Route
          path="/tournament"
          element={
            <div className="xelma-grid-bg px-4 py-20 text-center text-xl font-bold text-gray-500">
              Tournament — Coming Soon
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="xelma-grid-bg px-4 py-20 text-center text-xl font-bold text-gray-500">
              Profile — Coming Soon
            </div>
          }
        />
      </Routes>
      <Toaster richColors position="top-center" theme="dark" />
    </div>
  );
}

export default App;
