// ISSUE: Wire place_bet() to Xelma TypeScript bindings (xelma-contract)
// ISSUE: Wire claim_winnings() to contract

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { MockRound } from '../types';
import { mockUserStats } from '../data/mockData';
import CountdownTimer from './CountdownTimer';

interface BetModalProps {
  round: MockRound | null;
  open: boolean;
  onClose: () => void;
}

export default function BetModal({ round, open, onClose }: BetModalProps) {
  const [direction, setDirection] = useState<'UP' | 'DOWN' | null>(null);
  const [precisionPrice, setPrecisionPrice] = useState('');
  const [amount, setAmount] = useState('100');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !round) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const potentialReturn =
    round.mode === 'updown' ? parsedAmount * 1.5 : parsedAmount * 3;

  const canSubmit =
    parsedAmount > 0 &&
    parsedAmount <= mockUserStats.balance &&
    (round.mode === 'updown' ? direction !== null : precisionPrice.trim() !== '');

  const handleConfirm = () => {
    if (!canSubmit) return;

    // TODO: Wire to Xelma TypeScript bindings — client.place_bet() or client.place_precision_prediction()
    const mins = Math.floor(round.closesInSeconds / 60);
    const secs = String(round.closesInSeconds % 60).padStart(2, '0');
    toast.success(`Prediction submitted — round resolves in ${mins}:${secs}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prediction-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close prediction modal"
        onClick={onClose}
      />

      <div className="glass-card relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="prediction-modal-title" className="text-xl font-bold text-white">
              {round.asset} — {round.mode === 'updown' ? 'UP/DOWN' : 'Precision'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Resolves in <CountdownTimer initialSeconds={round.closesInSeconds} />
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {round.mode === 'updown' ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('UP')}
              className={`rounded-xl py-4 text-lg font-bold transition-all ${
                direction === 'UP'
                  ? 'bg-green-500 text-white ring-2 ring-green-400'
                  : 'bg-white/5 text-gray-300 hover:bg-green-500/20'
              }`}
            >
              UP ↑
            </button>
            <button
              type="button"
              onClick={() => setDirection('DOWN')}
              className={`rounded-xl py-4 text-lg font-bold transition-all ${
                direction === 'DOWN'
                  ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                  : 'bg-white/5 text-gray-300 hover:bg-rose-500/20'
              }`}
            >
              DOWN ↓
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <label htmlFor="precision-price" className="text-xs font-semibold uppercase text-gray-400">
              Target price
            </label>
            <input
              id="precision-price"
              type="number"
              step="0.0001"
              value={precisionPrice}
              onChange={(e) => setPrecisionPrice(e.target.value)}
              placeholder={String(round.startPrice)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#2C4BFD]"
            />
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="stake-amount" className="text-xs font-semibold uppercase text-gray-400">
            Stake
          </label>
          <div className="relative mt-2">
            <input
              id="stake-amount"
              type="number"
              min="1"
              max={mockUserStats.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white outline-none focus:border-[#2C4BFD]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-cyan-300">
              vXLM
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Practice balance: {mockUserStats.balance.toLocaleString()} vXLM
          </p>
        </div>

        <p className="mt-4 text-sm text-gray-300">
          Estimated payout:{' '}
          <span className="font-bold text-cyan-300">
            {potentialReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} vXLM
          </span>
        </p>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleConfirm}
          className="btn-primary mt-6 w-full rounded-xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit Prediction
        </button>
      </div>
    </div>
  );
}
