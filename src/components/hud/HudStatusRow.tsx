import { StatusChip } from "./StatusChip";
import type { ChipStatus } from "./StatusChip";
import { useRoundStore } from "../../store/useRoundStore";
import { useWalletStore, selectIsWalletConnected } from "../../store/useWalletStore";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";

interface HudStatusRowProps {
  playerCount?: number;
  className?: string;
}

function resolveRoundStatus(
  isRoundActive: boolean,
  isLoading: boolean
): { status: ChipStatus; value: string } {
  if (isLoading) return { status: "loading", value: "Loading…" };
  if (isRoundActive) return { status: "active", value: "Live" };
  return { status: "inactive", value: "No Round" };
}

function resolveWalletStatus(
  walletStatus: string,
  isConnected: boolean
): { status: ChipStatus; value: string } {
  if (walletStatus === "connecting" || walletStatus === "checking") {
    return { status: "loading", value: "Connecting…" };
  }
  if (isConnected) return { status: "active", value: "Connected" };
  if (walletStatus === "error") return { status: "error", value: "Error" };
  return { status: "inactive", value: "Disconnected" };
}

function resolveConnectionStatus(
  socketStatus: string
): { status: ChipStatus; value: string } {
  switch (socketStatus) {
    case "connected":
      return { status: "active", value: "Live" };
    case "connecting":
      return { status: "loading", value: "Connecting…" };
    case "reconnecting":
      return { status: "warning", value: "Reconnecting…" };
    default:
      return { status: "error", value: "Offline" };
  }
}

export const HudStatusRow = ({ playerCount, className = "" }: HudStatusRowProps) => {
  const isRoundActive = useRoundStore((s) => s.isRoundActive);
  const isRoundLoading = useRoundStore((s) => s.isLoading);
  const walletStatus = useWalletStore((s) => s.status);
  const isWalletConnected = useWalletStore(selectIsWalletConnected);
  const { status: socketStatus } = useConnectionStatus();

  const round = resolveRoundStatus(isRoundActive, isRoundLoading);
  const wallet = resolveWalletStatus(walletStatus, isWalletConnected);
  const connection = resolveConnectionStatus(socketStatus);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label="Platform status"
      role="status"
    >
      <StatusChip label="Round" value={round.value} status={round.status} />
      <StatusChip label="Wallet" value={wallet.value} status={wallet.status} />
      <StatusChip label="Stream" value={connection.value} status={connection.status} />
      {playerCount !== undefined && (
        <StatusChip
          label="Playing"
          value={String(playerCount)}
          status="info"
        />
      )}
    </div>
  );
};

export default HudStatusRow;
