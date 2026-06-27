import type { Guide, Tip } from '../types/education';
import type { NotificationItem } from '../types/notification';
import { apiFetch } from './api';

export { ApiError } from './api';

export const educationApi = {
    getGuides: () => apiFetch<Guide[]>('/api/education/guides'),
    getTip: () => apiFetch<Tip | null>('/api/education/tip'),
};

export interface Round {
    id: string | number;
    status?: string;
    startsAt?: string;
    endsAt?: string;
    resolvedAt?: string;
    [key: string]: unknown;
}

export const roundsApi = {
    getActive: () => apiFetch<Round | null>('/api/rounds/active'),
};

export interface UserPrediction {
    id: string | number;
    direction?: string;
    stake?: string | number;
    exactPrice?: string | number;
    roundId?: string | number;
    status?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface SubmitPredictionRequest {
    direction: 'UP' | 'DOWN';
    stake: string;
    exactPrice?: string;
    isLegend: boolean;
}

type UserPredictionsResponse =
    | UserPrediction[]
    | {
        predictions?: UserPrediction[];
        data?: UserPrediction[];
    };

function normalizeArrayResponse<T>(
    response: T[] | Record<string, unknown>,
    keys: string[]
): T[] {
    if (Array.isArray(response)) {
        return response;
    }

    for (const key of keys) {
        const value = response[key];
        if (Array.isArray(value)) {
            return value as T[];
        }
    }

    return [];
}

function normalizeUserPredictions(response: UserPredictionsResponse): UserPrediction[] {
    return normalizeArrayResponse<UserPrediction>(
        response as UserPrediction[] | Record<string, unknown>,
        ['predictions', 'data']
    );
}

export const predictionsApi = {
    getUserHistory: async (userId: string) => {
        const response = await apiFetch<UserPredictionsResponse>(`/api/predictions/user/${encodeURIComponent(userId)}`);
        return normalizeUserPredictions(response);
    },
    submit: async (prediction: SubmitPredictionRequest) => {
        return apiFetch<UserPrediction>('/api/predictions/submit', {
            method: 'POST',
            body: JSON.stringify(prediction),
        });
    },
};

export const notificationsApi = {
    getUnreadCount: () => apiFetch<{ unread: number }>('/api/notifications/unread-count'),
    getNotifications: () => apiFetch<NotificationItem[]>('/api/notifications'),
    markAsRead: (id: string) => apiFetch<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
    markAllAsRead: () => apiFetch<void>('/api/notifications/read-all', { method: 'POST' }),
};


export interface PricePoint {
    time: number;
    value: number;
}

type PriceResponse =
    | PricePoint[]
    | {
        prices?: PricePoint[];
        data?: PricePoint[];
        history?: PricePoint[];
        price?: number | string;
        value?: number | string;
        timestamp?: number | string;
        time?: number | string;
    };

function toPricePoint(value: unknown): PricePoint | null {
    if (!value || typeof value !== 'object') return null;
    const record = value as Record<string, unknown>;
    const rawTime = record.time ?? record.timestamp;
    const rawPrice = record.value ?? record.price;

    const time = typeof rawTime === 'string' ? Number(rawTime) : rawTime;
    const price = typeof rawPrice === 'string' ? Number(rawPrice) : rawPrice;

    if (!Number.isFinite(time) || !Number.isFinite(price)) return null;
    const normalizedTime = (time as number) > 9999999999 ? Math.floor((time as number) / 1000) : Math.floor(time as number);
    return { time: normalizedTime, value: price as number };
}

function normalizePriceResponse(response: PriceResponse): PricePoint[] {
    if (Array.isArray(response)) {
        return response.map(toPricePoint).filter((point): point is PricePoint => point !== null);
    }

    const history = response.prices ?? response.data ?? response.history;
    if (Array.isArray(history)) {
        return history.map(toPricePoint).filter((point): point is PricePoint => point !== null);
    }

    const singlePoint = toPricePoint(response);
    return singlePoint ? [singlePoint] : [];
}

export const priceApi = {
    getPriceSeries: async () => {
        const response = await apiFetch<PriceResponse>('/api/price');
        const normalized = normalizePriceResponse(response);
        return normalized.sort((a, b) => a.time - b.time);
    },
};

/** Leaderboard entry from GET /api/leaderboard?mode=UP_DOWN */
export interface LeaderboardEntry {
    id?: string | number;
    userId?: string;
    username?: string;
    name?: string;
    avatar?: string | null;
    xlm?: number;
    score?: number;
    [key: string]: unknown;
}

type LeaderboardResponse = LeaderboardEntry[] | { data?: LeaderboardEntry[]; leaderboard?: LeaderboardEntry[] };

function normalizeLeaderboard(response: LeaderboardResponse): LeaderboardEntry[] {
    return normalizeArrayResponse<LeaderboardEntry>(
        response as LeaderboardEntry[] | Record<string, unknown>,
        ['data', 'leaderboard']
    );
}

export const leaderboardApi = {
    getLeaderboard: async (mode: string = 'UP_DOWN') => {
        const response = await apiFetch<LeaderboardResponse>(`/api/leaderboard?mode=${encodeURIComponent(mode)}`);
        return normalizeLeaderboard(response);
    },
};
