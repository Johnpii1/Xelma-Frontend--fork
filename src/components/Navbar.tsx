// ISSUE: Integrate Freighter wallet connection (@stellar/freighter-api) — partial: uses useWalletStore
// ISSUE: Build Leaderboard page (/leaderboard)
// ISSUE: Build Tournament page (/tournament)
// ISSUE: Build User Profile page (/profile)

import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useWalletStore, selectIsWalletConnected } from '../store/useWalletStore';
import { mockUserStats } from '../data/mockData';
import Logo from '../assets/logo.svg';

interface NavLinkItem {
  label: string;
  to: string;
  disabled?: boolean;
  tooltip?: string;
}

const navLinks: NavLinkItem[] = [
  { label: 'Terminal', to: '/dashboard' },
  { label: 'Leaderboard', to: '/leaderboard', disabled: true, tooltip: 'Coming Soon' },
  { label: 'Learn', to: '/learn' },
];

function truncateAddress(key: string): string {
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export default function Navbar() {
  const location = useLocation();
  const isConnected = useWalletStore(selectIsWalletConnected);
  const publicKey = useWalletStore((s) => s.publicKey);
  const status = useWalletStore((s) => s.status);
  const connect = useWalletStore((s) => s.connect);
  const checkConnection = useWalletStore((s) => s.checkConnection);
  const isConnecting = status === 'connecting' || status === 'checking';

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#BEC7FE]/10 bg-[#0A0F1A]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={Logo} alt="Xelma" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-white">Xelma</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;

            if (item.disabled) {
              return (
                <li key={item.label}>
                  <span
                    className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium text-gray-600"
                    title={item.tooltip}
                  >
                    {item.label}
                  </span>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2C4BFD]/20 text-[#BEC7FE]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          {isConnected && publicKey ? (
            <>
              <span className="hidden rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 sm:inline">
                {mockUserStats.balance.toLocaleString()} vXLM
              </span>
              <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-gray-300 sm:inline">
                {truncateAddress(publicKey)}
              </span>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => void connect()}
            disabled={isConnecting}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {isConnecting ? 'Connecting…' : isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </nav>
    </header>
  );
}
