import { useState } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';
import { place_bet, place_precision_prediction } from '../lib/xelma-contract';
import { predictionsApi } from '../lib/api-client';

export interface PredictionData {
  direction: 'UP' | 'DOWN';
  stake: string;
  isLegend: boolean;
  exactPrice?: string;
}

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: PredictionData | null;
  onSuccess?: (txHash: string) => void;
}

type Step = 'confirm' | 'wallet_required' | 'preparing' | 'signing' | 'submitting' | 'syncing' | 'success' | 'error';

export default function BetModal({ isOpen, onClose, predictionData, onSuccess }: BetModalProps) {
  const status = useWalletStore((s) => s.status);
  const publicKey = useWalletStore((s) => s.publicKey);
  const connect = useWalletStore((s) => s.connect);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isConnected = status === 'connected' && !!publicKey;
  const initialStep = (!isConnected || !isAuthenticated) ? 'wallet_required' : 'confirm';

  const [step, setStep] = useState<Step>(initialStep);
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const currentConnected = status === 'connected' && !!publicKey;
      const targetStep = (!currentConnected || !isAuthenticated) ? 'wallet_required' : 'confirm';
      setStep(targetStep);
      setErrorMsg('');
      setTxHash('');
    }
  }

  if (!isOpen || !predictionData) return null;

  const handleConnectAndAuth = async () => {
    try {
      await connect();
      // Auth store logic can follow
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleConfirm = async () => {
    if (!publicKey) {
      setStep('wallet_required');
      return;
    }

    try {
      const updateStatus = (s: 'preparing' | 'signing' | 'submitting') => {
        setStep(s);
      };

      let result;
      if (predictionData.isLegend && predictionData.exactPrice) {
        result = await place_precision_prediction(
          publicKey,
          predictionData.direction,
          predictionData.stake,
          predictionData.exactPrice,
          updateStatus
        );
      } else {
        result = await place_bet(
          publicKey,
          predictionData.direction,
          predictionData.stake,
          updateStatus
        );
      }

      setTxHash(result.txHash);
      setStep('syncing');

      // Submit to backend
      await predictionsApi.submit({
        direction: predictionData.direction,
        stake: predictionData.stake,
        isLegend: predictionData.isLegend,
        exactPrice: predictionData.exactPrice,
      });

      setStep('success');
      if (onSuccess) {
        onSuccess(result.txHash);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Prediction submission error:', error);
      setErrorMsg(error.message || 'An unexpected error occurred');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card relative z-10 w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        {step === 'wallet_required' && (
          <div className="text-center py-4">
            <h3 className="text-lg font-bold text-red-400 mb-2">Wallet & Auth Required</h3>
            <p className="text-gray-400 text-sm mb-6">
              You need to connect and authenticate your Stellar wallet to submit predictions.
            </p>
            <button
              onClick={handleConnectAndAuth}
              className="w-full py-3 bg-[#2C4BFD] hover:bg-[#2C4BFD]/80 rounded-xl font-semibold transition"
            >
              Connect & Authenticate
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <h3 className="text-lg font-bold mb-4" id="prediction-modal-title">Confirm Prediction</h3>
            <div className="space-y-3 bg-gray-850 p-4 rounded-xl border border-gray-800 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Mode</span>
                <span className="font-semibold">
                  {predictionData.isLegend ? 'Legend Mode (Precision)' : 'UP/DOWN Match'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direction</span>
                <span className={`font-bold ${predictionData.direction === 'UP' ? 'text-green-400' : 'text-red-400'}`}>
                  {predictionData.direction}
                </span>
              </div>
              {predictionData.isLegend && predictionData.exactPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Price</span>
                  <span className="font-semibold text-yellow-400">${predictionData.exactPrice}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-800 pt-3">
                <span className="text-gray-400">Stake</span>
                <span className="font-bold text-cyan-400">{predictionData.stake} XLM</span>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition"
            >
              Confirm
            </button>
          </div>
        )}

        {(step === 'preparing' || step === 'signing' || step === 'submitting' || step === 'syncing') && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold">
              {step === 'preparing' && 'Preparing Transaction...'}
              {step === 'signing' && 'Waiting for Freighter Signature...'}
              {step === 'submitting' && 'Submitting Transaction to Network...'}
              {step === 'syncing' && 'Syncing Prediction to Backend...'}
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Please check your wallet interface if prompted.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold mb-2">Prediction Submitted!</h3>
            <p className="text-gray-400 text-sm mb-6">
              Your prediction has been successfully written on-chain and registered.
            </p>
            <div className="space-y-3">
              <a
                href={`https://stellarexpert.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition"
              >
                View on StellarExpert
              </a>
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-800 hover:bg-gray-850 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✕
            </div>
            <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
            <p className="text-red-400 text-sm mb-6 px-4 break-words">
              {errorMsg}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-[#2C4BFD] hover:bg-[#2C4BFD]/80 rounded-xl font-semibold transition"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-800 hover:bg-gray-850 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
