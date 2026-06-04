import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import "./App.css";
import Header from "./components/Header";
import NewsRibbon from "./components/NewsRibbon";
import Leaderboard from "./components/Leaderboard";
import RouteProgressBar from "./components/RouteProgressBar";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LearnPage from "./pages/Learn";
import Connect from "./pages/Connect";
import GameShell from "./components/layout/GameShell";
import { useWalletStore } from "./store/useWalletStore";

function App() {
  const [showNewsRibbon, setShowNewsRibbon] = useState(true);
  const isWalletConnected = useWalletStore((s) => s.publicKey !== null && s.publicKey !== "");

  return (
    <ThemeProvider>
      <RouteProgressBar />
      <Header />
      {showNewsRibbon && (
        <NewsRibbon onClose={() => setShowNewsRibbon(false)} />
      )}
      <GameShell showNewsRibbon={showNewsRibbon}>
        <Routes>
          <Route
            path="/"
            element={
              isWalletConnected ? (
                <Dashboard showNewsRibbon={showNewsRibbon} />
              ) : (
                <Landing showNewsRibbon={showNewsRibbon} />
              )
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/connect" element={<Connect />} />
          <Route
            path="/pools"
            element={
              <div className="text-center mt-20 text-2xl font-bold text-[#9B9B9B]">
                Pools Page Placeholder
              </div>
            }
          />
        </Routes>
      </GameShell>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}

export default App;