// ISSUE: Wire place_bet() to Xelma TypeScript bindings (xelma-contract)
// ISSUE: Real-time round updates via Soroban event polling

import type { MockRound } from '../types';
import CountdownTimer from './CountdownTimer';

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  XLM: '✦',
};

interface RoundCardProps {
  round: MockRound;
  onSubmitPrediction: (round: MockRound) => void;
}

function getStatusMeta(round: MockRound, secondsLeft: number) {
  if (secondsLeft > 0 && secondsLeft < 120) {
    return { label: 'CLOSING SOON', dotClass: 'status-dot-yellow' };
  }
  if (round.status === 'new') {
    return { label: 'OPEN', dotClass: 'status-dot-green' };
  }
  return { label: 'LIVE', dotClass: 'status-dot-live' };
}

function poolSize(round: MockRound): number {
  if (round.mode === 'updown') {
    return (round.poolUp ?? 0) + (round.poolDown ?? 0);
  }
  return round.totalPool ?? 0;
}

export default function RoundCard({ round, onSubmitPrediction }: RoundCardProps) {
  const total = poolSize(round);
  const upPct =
    round.mode === 'updown' && total > 0
      ? Math.round(((round.poolUp ?? 0) / total) * 100)
      : 0;
  const downPct = round.mode === 'updown' ? 100 - upPct : 0;

  return (
    <article className="glass-card rounded-2xl p-5 transition-all duration-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2C4BFD]/15 text-lg font-bold text-[#BEC7FE]"
            aria-hidden
          >
            {ASSET_ICONS[round.asset]}
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">{round.asset}/USD</h3>
            <p className="text-xs text-gray-500">
              Reference ${round.startPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            round.mode === 'updown'
              ? 'bg-[#2C4BFD]/15 text-[#BEC7FE]'
              : 'bg-cyan-500/15 text-cyan-300'
          }`}
        >
          {round.mode === 'updown' ? 'UP/DOWN' : 'PRECISION'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`status-dot ${getStatusMeta(round, round.closesInSeconds).dotClass}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {getStatusMeta(round, round.closesInSeconds).label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Resolves in</span>
          <CountdownTimer initialSeconds={round.closesInSeconds} />
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-300">
        Pool: {total.toLocaleString()} vXLM
      </p>

      {round.mode === 'updown' ? (
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="bg-[#2C4BFD] transition-all"
              style={{ width: `${upPct}%` }}
              title={`UP ${upPct}%`}
            />
            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${downPct}%` }}
              title={`DOWN ${downPct}%`}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span className="text-[#BEC7FE]">UP {upPct}%</span>
            <span className="text-rose-400">DOWN {downPct}%</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-cyan-300">
          {round.predictionCount ?? 0} forecasts submitted
        </p>
      )}

      <button
        type="button"
        disabled={round.closesInSeconds <= 0}
        onClick={() => onSubmitPrediction(round)}
        className="btn-primary mt-5 w-full rounded-xl py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Prediction
      </button>
    </article>
  );
}
