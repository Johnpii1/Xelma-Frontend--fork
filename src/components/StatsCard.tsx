// ISSUE: Replace mock stats with live API call to backend /api/stats
// ISSUE: Add XP and rank progression system UI

import type { MockUserStats } from '../types';

interface StatsCardProps {
  stats: MockUserStats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <section className="glass-card rounded-2xl p-5" aria-labelledby="your-stats-title">
      <h2 id="your-stats-title" className="text-lg font-bold text-white">
        Your Record
      </h2>

      <dl className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-400">Practice Balance</dt>
          <dd className="text-lg font-bold text-cyan-300">
            {stats.balance.toLocaleString()} vXLM
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-400">Accuracy Streak</dt>
          <dd className="text-lg font-bold text-[#BEC7FE]">{stats.currentStreak} rounds</dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-400">Correct / Incorrect</dt>
          <dd className="font-semibold text-white">
            <span className="text-green-400">{stats.totalWins}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-rose-400">{stats.totalLosses}</span>
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-400">Rank</dt>
          <dd>
            <span className="rounded-full bg-[#2C4BFD]/15 px-3 py-1 text-sm font-bold text-[#BEC7FE]">
              {stats.rank}
            </span>
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <dt className="text-sm text-gray-400">Experience</dt>
          <dd className="font-mono text-sm text-gray-300">{stats.xp} XP</dd>
        </div>
      </dl>

      <button
        type="button"
        disabled
        title="No pending rewards"
        className="mt-6 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-500"
      >
        Claim Rewards
      </button>
      <p className="mt-2 text-center text-xs text-gray-600">No pending rewards</p>
    </section>
  );
}
