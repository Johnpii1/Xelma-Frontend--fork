import type { RecentActivityItem } from '../types';

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="glass-card rounded-2xl p-5" aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title" className="text-lg font-bold text-white">
        Recent Predictions
      </h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{item.asset}</p>
              <p className="text-xs uppercase text-gray-500">{item.mode}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  item.result === 'Won' ? 'text-green-400' : 'text-rose-400'
                }`}
              >
                {item.result === 'Won' ? 'Correct' : 'Incorrect'}
              </p>
              <p className="text-xs text-gray-400">{item.amount} vXLM</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
