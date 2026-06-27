import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ChatSidebar } from '../ChatSidebar';
import { socketService } from '../../lib/socket';
import { useRoundStore } from '../../store/useRoundStore';
import type { Round } from '../../lib/api-client';

vi.mock('../../lib/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinChat: vi.fn(),
    leaveChat: vi.fn(),
    onChatMessage: vi.fn(() => () => {}),
    sendChat: vi.fn(),
    isConnected: vi.fn(() => true),
  },
}));

vi.mock('../../hooks/useConnectionStatus', () => ({
  useConnectionStatus: () => ({
    status: 'connected',
    isConnected: true,
    isConnecting: false,
    isReconnecting: false,
    isDisconnected: false,
  }),
}));

// Drive a Zustand state change through React's commit + effect flush using
// the async form of `act` so React 19 does not log "An update to ChatSidebar
// inside a test was not wrapped in act(...)" warnings.
async function setActiveRound(round: Round | null) {
  await act(async () => {
    useRoundStore.setState({ activeRound: round });
  });
}

describe('ChatSidebar — round-scoped chat channel (#185)', () => {
  const initialActiveRound = useRoundStore.getState().activeRound;

  beforeEach(() => {
    vi.clearAllMocks();
    (socketService.onChatMessage as ReturnType<typeof vi.fn>).mockReturnValue(() => {});
    useRoundStore.setState({ activeRound: null });
  });

  afterEach(() => {
    useRoundStore.setState({ activeRound: initialActiveRound });
  });

  it('joins the fallback "general" channel when there is no active round', () => {
    render(<ChatSidebar />);

    expect(socketService.connect).toHaveBeenCalled();
    expect(socketService.joinChat).toHaveBeenCalledWith('general');
    expect(socketService.leaveChat).not.toHaveBeenCalled();
  });

  it('joins "round:<id>" when an active round with a numeric id is set', async () => {
    await setActiveRound({ id: 42 } as Round);

    render(<ChatSidebar />);

    expect(socketService.joinChat).toHaveBeenCalledWith('round:42');
  });

  it('joins "round:<id>" when an active round with a string id is set', async () => {
    await setActiveRound({ id: 'round-abc' } as Round);

    render(<ChatSidebar />);

    expect(socketService.joinChat).toHaveBeenCalledWith('round:round-abc');
  });

  it('leaves the previous channel and rejoins when active round changes', async () => {
    await setActiveRound({ id: 'r1' } as Round);
    render(<ChatSidebar />);
    expect(socketService.joinChat).toHaveBeenCalledWith('round:r1');

    await setActiveRound({ id: 'r2' } as Round);

    expect(socketService.leaveChat).toHaveBeenCalledWith('round:r1');
    expect(socketService.joinChat).toHaveBeenCalledWith('round:r2');
  });

  it('falls back to "general" when the active round is cleared', async () => {
    await setActiveRound({ id: 'r1' } as Round);
    render(<ChatSidebar />);
    expect(socketService.joinChat).toHaveBeenCalledWith('round:r1');

    await setActiveRound(null);

    expect(socketService.leaveChat).toHaveBeenCalledWith('round:r1');
    expect(socketService.joinChat).toHaveBeenCalledWith('general');
  });

  it('leaves the current channel on unmount', async () => {
    await setActiveRound({ id: 'gone' } as Round);
    const { unmount } = render(<ChatSidebar />);
    expect(socketService.joinChat).toHaveBeenCalledWith('round:gone');

    unmount();

    expect(socketService.leaveChat).toHaveBeenCalledWith('round:gone');
  });

  it('still renders the chat input UI while the channel subscription effect runs', () => {
    render(<ChatSidebar />);

    // Sanity check that the UI is fully mounted — the message input is what
    // we primarily care about because it depends on the same effect chain we
    // are testing.
    expect(screen.getByLabelText('Message input')).toBeInTheDocument();
  });
});
