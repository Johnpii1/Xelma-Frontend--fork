
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useState } from 'react';

/**
 * Global offline banner displayed at the top of the app when the connection is lost.
 * It is dismissible and provides a "Reconnect" button that triggers a forced
 * reconnection via socketService.forceReconnect().
 */
export const OfflineBanner = () => {
  const { isDisconnected, reconnect } = useConnectionStatus();
  const [dismissed, setDismissed] = useState(false);

  // Hide banner when connected or user dismissed it
  if (!isDisconnected || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-red-600 text-white px-4 py-2 shadow-md backdrop-filter backdrop-blur-sm">
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span>Live updates disconnected – some features may be unavailable.</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={reconnect}
          className="rounded bg-white bg-opacity-20 px-3 py-1 text-sm hover:bg-opacity-30 transition"
        >
          Reconnect
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded bg-white bg-opacity-20 px-2 py-1 text-xs hover:bg-opacity-30 transition"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
