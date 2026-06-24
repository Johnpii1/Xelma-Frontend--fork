import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { useWalletStore, selectIsWalletConnected } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';
import { place_bet, place_precision_prediction } from '../lib/xelma-contract';
import { predictionsApi } from '../lib/api-client';
import { ArrowUp, ArrowDown, CheckCircle2, XCircle, Loader2, Wallet, ExternalLink, RefreshCw } from 'lucide-react';
import type { PredictionData } from './PredictionControls';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: PredictionData | null;
  onSuccess?: (txHash: string) => void;
}

type BetStep = 'idle' | 'preparing' | 'signing' | 'submitting' | 'syncing' | 'success' | 'error';

export default function BetModal({ isOpen, onClose, predictionData, onSuccess }: BetModalProps) {
  const [step, setStep] = useState<BetStep>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  const isWalletConnected = useWalletStore(selectIsWalletConnected);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const isWalletConnecting = useWalletStore(
    (s) => s.status === 'connecting' || s.status === 'checking'
  );
  const connectWallet = useWalletStore((s) => s.connect);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setStep('idle');
      setErrorMsg('');
      setTxHash('');
    }
  }, [isOpen]);

  if (!predictionData) return null;

  const handleConnectAndAuth = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const executeSubmit = async () => {
    if (!walletPublicKey) {
      setStep('error');
      setErrorMsg('Wallet is not connected.');
      return;
    }

    try {
      // Step 1: Preparing
      setStep('preparing');
      
      // Step 2: Sign and Submit contract call
      let result;
      if (predictionData.isLegend && predictionData.exactPrice) {
        result = await place_precision_prediction(
          walletPublicKey,
          predictionData.direction,
          predictionData.stake,
          predictionData.exactPrice,
          (status) => setStep(status)
        );
      } else {
        result = await place_bet(
          walletPublicKey,
          predictionData.direction,
          predictionData.stake,
          (status) => setStep(status)
        );
      }

      setTxHash(result.txHash);

      // Step 3: Syncing to backend
      setStep('syncing');
      await predictionsApi.submit({
        direction: predictionData.direction,
        stake: predictionData.stake,
        exactPrice: predictionData.exactPrice,
        isLegend: predictionData.isLegend,
      });

      // Step 4: Success
      setStep('success');
      onSuccess?.(result.txHash);
    } catch (err: any) {
      console.error('Prediction submission error:', err);
      setStep('error');
      setErrorMsg(err.message || 'An unexpected error occurred during contract prediction.');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'idle':
        return 'Confirm Prediction';
      case 'preparing':
        return 'Preparing On-Chain Tx';
      case 'signing':
        return 'Signing Transaction';
      case 'submitting':
        return 'Broadcasting to Stellar';
      case 'syncing':
        return 'Recording Prediction';
      case 'success':
        return 'Prediction Confirmed!';
      case 'error':
        return 'Transaction Failed';
      default:
        return 'Predict Round';
    }
  };

  const isRequirementMet = isWalletConnected && isAuthenticated;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing during active transaction processing
        const activeSteps: BetStep[] = ['preparing', 'signing', 'submitting', 'syncing'];
        if (!open && !activeSteps.includes(step)) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in z-50" />

        <Dialog.Content 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none"
          onPointerDownOutside={(e) => {
            // Prevent close on click outside during transaction processing
            const activeSteps: BetStep[] = ['preparing', 'signing', 'submitting', 'syncing'];
            if (activeSteps.includes(step)) {
              e.preventDefault();
            }
          }}
        >
          <div className="w-full max-w-md animate-scale-in">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6">
              
              {/* Header */}
              <div className="text-center mb-6">
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  {getStepTitle()}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  XELMA Prediction Smart Contract Interaction
                </Dialog.Description>
              </div>

              {/* Status Machine Render */}

              {/* Step: IDLE (Confirmation Details) */}
              {step === 'idle' && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Type</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {predictionData.isLegend ? 'Legend Mode (Precision)' : 'UP/DOWN Match'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Direction</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        predictionData.direction === 'UP' ? 'text-green-500' : 'text-rose-500'
                      }`}>
                        {predictionData.direction === 'UP' ? (
                          <>
                            <ArrowUp className="w-4 h-4" /> UP
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-4 h-4" /> DOWN
                          </>
                        )}
                      </span>
                    </div>

                    {predictionData.isLegend && predictionData.exactPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Exact Price</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 tabular-nums">
                          ${parseFloat(predictionData.exactPrice).toFixed(4)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Stake</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg tabular-nums">
                        {predictionData.stake} XLM
                      </span>
                    </div>
                  </div>

                  {!isRequirementMet ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5 text-center">
                      <Wallet className="w-8 h-8 text-yellow-500 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Wallet & Auth Required</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px]">
                          Connect your wallet and sign the server challenge first.
                        </p>
                      </div>
                      <button
                        onClick={handleConnectAndAuth}
                        disabled={isWalletConnecting}
                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-black active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {isWalletConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                          </>
                        ) : (
                          'Connect & Authenticate'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={executeSubmit}
                        className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all active:scale-95"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Steps: Loading States */}
              {['preparing', 'signing', 'submitting', 'syncing'].includes(step) && (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {step === 'preparing' && 'Tx'}
                      {step === 'signing' && 'Key'}
                      {step === 'submitting' && 'Net'}
                      {step === 'syncing' && 'DB'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {step === 'preparing' && 'Preparing Transaction...'}
                      {step === 'signing' && 'Waiting for Freighter signature...'}
                      {step === 'submitting' && 'Broadcasting prediction on-chain...'}
                      {step === 'syncing' && 'Syncing database record...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step === 'preparing' && 'Simulating gas footprint & network fees.'}
                      {step === 'signing' && 'Please approve the Freighter pop-up request.'}
                      {step === 'submitting' && 'Waiting for block validator confirmation.'}
                      {step === 'syncing' && 'Registering prediction on the dashboard server.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step: SUCCESS */}
              {step === 'success' && (
                <div className="text-center py-4 space-y-5 animate-fade-in">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      Prediction Submitted!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your on-chain prediction was successfully registered.
                    </p>
                  </div>

                  {txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-600 border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 rounded-full transition-all"
                    >
                      View on StellarExpert <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Step: ERROR */}
              {step === 'error' && (
                <div className="text-center py-4 space-y-5 animate-fade-in">
                  <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      Transaction Failed
                    </p>
                    <p className="text-xs text-rose-500 dark:text-rose-400 max-h-[100px] overflow-y-auto px-4 leading-relaxed font-medium">
                      {errorMsg}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
                    >
                      Close
                    </button>
                    <button
                      onClick={executeSubmit}
                      className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
