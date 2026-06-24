import { useEffect, useState, useRef } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import PriceChart from "../components/PriceChart";
import PredictionCard from "../components/PredictionCard";
import type { PredictionData } from "../components/PredictionControls";
import BetModal from "../components/BetModal";
import { useRoundStore } from "../store/useRoundStore";
import PredictionHistory from "../components/PredictionHistory";
import { useWalletStore, selectIsWalletConnected } from "../store/useWalletStore";
import { predictionsApi, ApiError } from "../lib/api-client";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { useConnectionStatus } from "../hooks/useConnectionStatus";

interface DashboardProps {
  showNewsRibbon?: boolean;
}

const Dashboard = ({ showNewsRibbon = true }: DashboardProps) => {
  const isRoundActive = useRoundStore((state) => state.isRoundActive);
  const sseConnection = useRoundStore((state) => state.sseConnection);
  const isWalletConnected = useWalletStore(selectIsWalletConnected);
  const isWalletConnecting = useWalletStore(
    (s) => s.status === "connecting" || s.status === "checking"
  );
  const publicKey = useWalletStore((s) => s.publicKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [pendingPrediction, setPendingPrediction] = useState<PredictionData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { isConnected: isSocketConnected } = useConnectionStatus();

  useEffect(() => {
    const { fetchActiveRound, subscribeToRoundEvents } = useRoundStore.getState();

    void fetchActiveRound();
    const unsubscribe = subscribeToRoundEvents();

    return () => {
      unsubscribe();
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePrediction = (data: PredictionData) => {
    setPendingPrediction(data);
    setIsBetModalOpen(true);
  };

  return (
    <div className="dashboard flex min-h-full">
      <ChatSidebar showNewsRibbon={showNewsRibbon} />

      <div className="flex-1 ml-0 md:ml-80 transition-[margin] duration-300 ease-in-out p-4 lg:p-6">
        {/* Connection Status Banner */}
        {(!isSocketConnected || (sseConnection && sseConnection.status !== 'connected')) && (
          <div className="mb-4">
            <ConnectionStatus />
            {sseConnection && sseConnection.status !== 'connected' && sseConnection.error && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Round updates: {sseConnection.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message display */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
            role="alert"
          >
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Center: Prediction controls (Issue: core prediction area) */}
          <div className="dashboard__center lg:col-span-1 flex flex-col gap-6">
            <PredictionCard
              isWalletConnected={isWalletConnected}
              isRoundActive={isRoundActive}
              isConnecting={isWalletConnecting}
              isSubmittingPrediction={isSubmitting || isBetModalOpen}
              onPrediction={handlePrediction}
            />
          </div>

          {/* Right: Price chart and placeholder */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Price Chart */}
            <div className="min-h-[350px] bg-white dark:bg-gray-800 p-6 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700">
              <PriceChart height={280} />
            </div>

            <div className="mt-5 p-4 bg-black/5 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                142 Playing Now
              </p>
            </div>

            <PredictionHistory userId={publicKey} />
          </div>
        </div>
      </div>

      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => {
          setIsBetModalOpen(false);
          setPendingPrediction(null);
        }}
        predictionData={pendingPrediction}
        onSuccess={(txHash) => {
          console.log("Prediction confirmed on-chain. TxHash:", txHash);
        }}
      />
    </div>
  );
};

export default Dashboard;
