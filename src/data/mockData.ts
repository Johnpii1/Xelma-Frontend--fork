import type { MockRound, MockUserStats, RecentActivityItem } from '../types';

export const mockRounds: MockRound[] = [
  {
    id: 1,
    asset: 'BTC',
    mode: 'updown',
    status: 'live',
    startPrice: 67420,
    poolUp: 2800,
    poolDown: 1400,
    closesInSeconds: 194,
  },
  {
    id: 2,
    asset: 'ETH',
    mode: 'precision',
    status: 'live',
    startPrice: 3241,
    totalPool: 1800,
    predictionCount: 22,
    closesInSeconds: 760,
  },
  {
    id: 3,
    asset: 'XLM',
    mode: 'updown',
    status: 'new',
    startPrice: 0.2891,
    poolUp: 200,
    poolDown: 0,
    closesInSeconds: 1200,
  },
];

export const mockUserStats: MockUserStats = {
  balance: 1000,
  pendingWinnings: 0,
  totalWins: 3,
  totalLosses: 1,
  currentStreak: 3,
  xp: 410,
  rank: 'Rookie',
};

export const mockRecentActivity: RecentActivityItem[] = [
  { id: '1', asset: 'BTC', result: 'Won', amount: 150, mode: 'updown' },
  { id: '2', asset: 'ETH', result: 'Lost', amount: 50, mode: 'precision' },
  { id: '3', asset: 'XLM', result: 'Won', amount: 80, mode: 'updown' },
  { id: '4', asset: 'BTC', result: 'Won', amount: 120, mode: 'updown' },
];

export const mockLandingStats = {
  totalRounds: 1247,
  vXlmDistributed: 4_200_000,
  activePlayers: 893,
};
