import { useEffect, useMemo, useState } from "react";
import { Activity, Radio, ShieldAlert, Sparkles, Timer, Users } from "lucide-react";
import { socketService } from "../lib/socket";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useRoundStore } from "../store/useRoundStore";

type LiveStatsSnapshot = {
  activePlayers?: number;
  recentPredictions?: number;
  lastUpdated?: Date;
};

type LiveStatsPayload = Record<string, unknown>;

function toFiniteNumber(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined;
}

function normalizeStatsPayload(payload: unknown): LiveStatsSnapshot {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const data = payload as LiveStatsPayload;
  const nested =
    data.stats && typeof data.stats === "object"
      ? (data.stats as LiveStatsPayload)
      : data.data && typeof data.data === "object"
        ? (data.data as LiveStatsPayload)
        : data;

  return {
    activePlayers:
      toFiniteNumber(nested.activePlayers) ??
      toFiniteNumber(nested.playersOnline) ??
      toFiniteNumber(nested.playerCount) ??
      toFiniteNumber(nested.onlinePlayers),
    recentPredictions:
      toFiniteNumber(nested.recentPredictions) ??
      toFiniteNumber(nested.recentPredictionsCount) ??
      toFiniteNumber(nested.predictionsCount) ??
      toFiniteNumber(nested.predictionCount) ??
      toFiniteNumber(nested.totalPredictions),
    lastUpdated: new Date(),
  };
}

function formatMetric(value: number | undefined, fallback = "—") {
  return typeof value === "number" ? value.toLocaleString() : fallback;
}

function getRoundDisplayStatus(isRoundActive: boolean, status?: unknown) {
  if (typeof status === "string" && status.trim()) {
    return status.replace(/[_-]/g, " ");
  }

  return isRoundActive ? "live" : "waiting";
}

function getConnectionBadge(
  isSocketConnected: boolean,
  streamStatus?: "disconnected" | "connecting" | "connected" | "reconnecting"
) {
  if (isSocketConnected && streamStatus === "connected") {
    return {
      label: "Live",
      className: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
      dot: "bg-emerald-500",
    };
  }

  if (isSocketConnected || streamStatus === "connecting" || streamStatus === "reconnecting") {
    return {
      label: streamStatus === "reconnecting" ? "Reconnecting" : "Syncing",
      className: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
      dot: "bg-amber-400 animate-pulse",
    };
  }

  return {
    label: "Offline",
    className: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
    dot: "bg-rose-500",
  };
}

export default function LiveGameStatsPanel() {
  const activeRound = useRoundStore((state) => state.activeRound);
  const isRoundActive = useRoundStore((state) => state.isRoundActive);
  const isLoading = useRoundStore((state) => state.isLoading);
  const sseConnection = useRoundStore((state) => state.sseConnection);
  const { isConnected: isSocketConnected } = useConnectionStatus();
  const [liveStats, setLiveStats] = useState<LiveStatsSnapshot>({});

  useEffect(() => {
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    const unsubscribeStats = socketService.onLiveGameStats((payload) => {
      const snapshot = normalizeStatsPayload(payload);
      setLiveStats((current) => ({
        ...current,
        ...snapshot,
      }));
    });

    const unsubscribePrediction = socketService.onPredictionCreated(() => {
      setLiveStats((current) => ({
        ...current,
        recentPredictions: (current.recentPredictions ?? 0) + 1,
        lastUpdated: new Date(),
      }));
    });

    return () => {
      unsubscribeStats();
      unsubscribePrediction();
    };
  }, []);

  const inferredActivePlayers =
    liveStats.activePlayers ??
    toFiniteNumber(activeRound?.activePlayers) ??
    toFiniteNumber(activeRound?.playersOnline) ??
    toFiniteNumber(activeRound?.playerCount) ??
    toFiniteNumber(activeRound?.participantsCount);

  const inferredPredictions =
    liveStats.recentPredictions ??
    toFiniteNumber(activeRound?.recentPredictions) ??
    toFiniteNumber(activeRound?.recentPredictionsCount) ??
    toFiniteNumber(activeRound?.predictionsCount) ??
    toFiniteNumber(activeRound?.predictionCount);

  const roundStatus = getRoundDisplayStatus(isRoundActive, activeRound?.status);
  const connectionBadge = getConnectionBadge(isSocketConnected, sseConnection?.status);
  const hasRound = Boolean(activeRound?.id);

  const supportingCopy = useMemo(() => {
    if (isLoading) {
      return "Loading the latest game telemetry…";
    }

    if (!isSocketConnected && sseConnection?.status !== "connected") {
      return "Realtime updates are paused. Showing the latest available snapshot.";
    }

    if (!hasRound) {
      return "No active round is broadcasting yet. Stay ready for the next launch.";
    }

    return "Live telemetry refreshes as players join rounds and predictions land.";
  }, [hasRound, isLoading, isSocketConnected, sseConnection?.status]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 text-white shadow-lg shadow-indigo-950/20 dark:border-indigo-400/20">
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Live Game Stats
            </div>
            <h2 className="text-2xl font-black tracking-tight">Platform pulse</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-300">{supportingCopy}</p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${connectionBadge.className}`}
            aria-label={`Realtime connection status: ${connectionBadge.label}`}
          >
            <span className={`h-2 w-2 rounded-full ${connectionBadge.dot}`} aria-hidden="true" />
            {connectionBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Users className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Active players
            </div>
            <p className="mt-3 text-3xl font-black">{isLoading ? "…" : formatMetric(inferredActivePlayers)}</p>
            {!isLoading && inferredActivePlayers === undefined && (
              <p className="mt-1 text-xs text-slate-400">Awaiting player feed</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Activity className="h-4 w-4 text-fuchsia-300" aria-hidden="true" />
              Recent predictions
            </div>
            <p className="mt-3 text-3xl font-black">{isLoading ? "…" : formatMetric(inferredPredictions)}</p>
            {!isLoading && inferredPredictions === undefined && (
              <p className="mt-1 text-xs text-slate-400">No prediction count yet</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Timer className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Round status
            </div>
            <p className="mt-3 truncate text-2xl font-black capitalize">{isLoading ? "Loading" : roundStatus}</p>
            <p className="mt-1 truncate text-xs text-slate-400">Round {hasRound ? `#${activeRound?.id}` : "pending"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isSocketConnected || sseConnection?.status === "connected" ? (
              <Radio className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-300" aria-hidden="true" />
            )}
            <span>
              Round stream: <span className="font-semibold capitalize text-white">{sseConnection?.status ?? "disconnected"}</span>
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {liveStats.lastUpdated ? `Updated ${liveStats.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Listening for live events"}
          </span>
        </div>
      </div>
    </section>
  );
}
