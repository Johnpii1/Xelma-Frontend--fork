// ISSUE: Replace mock stats with live API call to backend /api/stats
// ISSUE: Real-time round updates via Soroban event polling

import { useState } from 'react';
import { Link } from 'react-router-dom';
import BetModal from '../components/BetModal';
import RoundCard from '../components/RoundCard';
import RecentActivity from '../components/RecentActivity';
import StatsCard from '../components/StatsCard';
import { mockRounds, mockRecentActivity, mockUserStats } from '../data/mockData';
import type { MockRound } from '../types';
import { selectIsWalletConnected, useWalletStore } from '../store/useWalletStore';

export default function Dashboard() {
  const [selectedRound, setSelectedRound] = useState<MockRound | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isConnected = useWalletStore(selectIsWalletConnected);

  const openPredictionModal = (round: MockRound) => {
    setSelectedRound(round);
    setModalOpen(true);
  };

  const closePredictionModal = () => {
    setModalOpen(false);
    setSelectedRound(null);
  };

  return (
    <div className="xelma-grid-bg min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {!isConnected && (
          <div className="mb-6 rounded-xl border border-[#2C4BFD]/30 bg-[#2C4BFD]/10 px-4 py-3 text-sm text-[#BEC7FE]">
            Connect your wallet to submit predictions.{' '}
            <Link to="/connect" className="font-semibold underline hover:text-white">
              Connect now
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Prediction Terminal</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live rounds on Stellar testnet — directional and precision forecasts.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="live-rounds-title">
            <h2
              id="live-rounds-title"
              className="mb-6 flex items-center gap-2 text-lg font-semibold text-white"
            >
              <span className="status-dot status-dot-live" />
              Active Rounds
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              {mockRounds.map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  onSubmitPrediction={openPredictionModal}
                />
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <StatsCard stats={mockUserStats} />
            <RecentActivity items={mockRecentActivity} />
          </aside>
        </div>
      </div>

      <BetModal
        key={selectedRound ? `${selectedRound.id}-${modalOpen ? 'open' : 'closed'}` : 'none'}
        round={selectedRound}
        open={modalOpen}
        onClose={closePredictionModal}
      />
    </div>
  );
}
