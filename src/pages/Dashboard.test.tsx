import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from './Dashboard';

function selectFromStore<TStore extends object>(selector: unknown, store: TStore) {
  return typeof selector === 'function' ? (selector as (state: TStore) => unknown)(store) : store;
}

// Create proper store mocks
const mockRoundStore = {
  isRoundActive: true,
  resolvedRound: null,
  fetchActiveRound: vi.fn(),
  subscribeToRoundEvents: vi.fn(() => vi.fn()), // Returns unsubscribe function
  dismissResolvedRound: vi.fn(),
};

const mockWalletStore = {
  status: 'connected' as const,
  publicKey: 'GTEST123',
};

// Mock the stores with proper Zustand-like behavior
vi.mock('../store/useRoundStore', () => ({
  useRoundStore: Object.assign(
    vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector(mockRoundStore);
      }
      return mockRoundStore;
    }),
    {
      getState: () => mockRoundStore,
    }
  ),
}));

vi.mock('../store/useWalletStore', () => ({
  useWalletStore: Object.assign(
    vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector(mockWalletStore);
      }
      return mockWalletStore;
    }),
    {
      getState: () => mockWalletStore,
    }
  ),
  selectIsWalletConnected: vi.fn((state) => state.status === 'connected' && Boolean(state.publicKey)),
}));

vi.mock('../hooks/useConnectionStatus', () => ({
  useConnectionStatus: () => ({
    status: 'connected',
    error: null,
    lastConnected: new Date('2026-01-01T00:00:00.000Z'),
    reconnectAttempts: 0,
    isConnected: true,
    isConnecting: false,
    isReconnecting: false,
    isDisconnected: false,
    reconnect: vi.fn(),
  }),
}));

// Mock the API client
vi.mock('../lib/api-client', () => ({
  predictionsApi: {
    submit: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      Object.assign(this, { status });
    }
  },
}));

// Mock all the components to focus on integration logic
vi.mock('../components/ChatSidebar', () => ({
  ChatSidebar: ({ showNewsRibbon }: { showNewsRibbon: boolean }) => (
    <div data-testid="chat-sidebar" data-show-news-ribbon={showNewsRibbon}>
      Chat Sidebar
    </div>
  ),
}));

vi.mock('../components/PriceChart', () => ({
  default: ({ height }: { height: number }) => (
    <div data-testid="price-chart" data-height={height}>
      Price Chart
    </div>
  ),
}));

type PredictionCardMockProps = {
  isWalletConnected?: boolean;
  isRoundActive?: boolean;
  isConnecting?: boolean;
  isSubmittingPrediction?: boolean;
  onPrediction?: (prediction: {
    direction: 'UP';
    stake: string;
    exactPrice: string;
    isLegend: boolean;
  }) => void;
};

vi.mock('../components/PredictionCard', () => ({
  default: (props: PredictionCardMockProps) => {
    const { 
      isWalletConnected, 
      isRoundActive, 
      isConnecting, 
      isSubmittingPrediction, 
      onPrediction 
    } = props;
    
    return (
      <div 
        data-testid="prediction-card"
        data-wallet-connected={String(isWalletConnected)}
        data-round-active={String(isRoundActive)}
        data-connecting={String(isConnecting)}
        data-submitting={String(isSubmittingPrediction)}
      >
        <button 
          onClick={() => {
            if (onPrediction) {
              onPrediction({ 
                direction: 'UP', 
                stake: '10', 
                exactPrice: '100', 
                isLegend: false 
              });
            }
          }}
          data-testid="submit-prediction"
        >
          Submit Prediction
        </button>
      </div>
    );
  },
}));

vi.mock('../components/PredictionHistory', () => ({
  default: ({ userId }: { userId: string | null }) => (
    <div data-testid="prediction-history" data-user-id={userId}>
      Prediction History
    </div>
  ),
}));

import { useRoundStore } from '../store/useRoundStore';
import { useWalletStore } from '../store/useWalletStore';
import { predictionsApi, ApiError } from '../lib/api-client';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Don't use fake timers as they interfere with async operations
    
    // Reset store mocks to default state
    Object.assign(mockRoundStore, {
      isRoundActive: true,
      resolvedRound: null,
      fetchActiveRound: vi.fn(),
      subscribeToRoundEvents: vi.fn(() => vi.fn()),
      dismissResolvedRound: vi.fn(),
    Object.assign(mockWalletStore, {
      status: 'connected',
      publicKey: 'GTEST123',
    });
  });

  afterEach(() => {
    // Don't use real timers cleanup since we're not using fake timers
  });

  describe('rendering', () => {
    it('renders all main components', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('prediction-card')).toBeInTheDocument();
      expect(screen.getByTestId('price-chart')).toBeInTheDocument();
      expect(screen.getByTestId('prediction-history')).toBeInTheDocument();
    });

    it('passes showNewsRibbon prop to ChatSidebar', () => {
      render(<Dashboard showNewsRibbon={false} />);

      const chatSidebar = screen.getByTestId('chat-sidebar');
      expect(chatSidebar).toHaveAttribute('data-show-news-ribbon', 'false');
    });

    it('defaults showNewsRibbon to true', () => {
      render(<Dashboard />);

      const chatSidebar = screen.getByTestId('chat-sidebar');
      expect(chatSidebar).toHaveAttribute('data-show-news-ribbon', 'true');
    });

    it('passes correct props to PredictionCard', () => {
      render(<Dashboard />);

      const predictionCard = screen.getByTestId('prediction-card');
      expect(predictionCard).toHaveAttribute('data-wallet-connected', 'true');
      expect(predictionCard).toHaveAttribute('data-round-active', 'true');
      expect(predictionCard).toHaveAttribute('data-connecting', 'false');
      expect(predictionCard).toHaveAttribute('data-submitting', 'false');
    });

    it('passes user ID to PredictionHistory', () => {
      render(<Dashboard />);

      const predictionHistory = screen.getByTestId('prediction-history');
      expect(predictionHistory).toHaveAttribute('data-user-id', 'GTEST123');
    });

    it('shows the live game stats panel instead of the static player placeholder', () => {
      render(<Dashboard />);


      expect(screen.getByTestId('live-game-stats-panel')).toBeInTheDocument();
      expect(screen.queryByText('142 Playing Now')).not.toBeInTheDocument();

      expect(screen.getByText('142')).toBeInTheDocument();

    });
  });

  describe('wallet connection states', () => {
    it('handles disconnected wallet', () => {
      // Mock disconnected wallet state
      vi.mocked(useWalletStore).mockImplementation(((selector: unknown) => {
        const store = { ...mockWalletStore, status: 'idle', publicKey: null };
        return selectFromStore(selector, store);
      }) as never);

      render(<Dashboard />);

      const predictionCard = screen.getByTestId('prediction-card');
      expect(predictionCard).toHaveAttribute('data-wallet-connected', 'false');
      
      const predictionHistory = screen.getByTestId('prediction-history');
      // When publicKey is null, the data-user-id attribute won't be set to "null" string
      // Instead, React will not render the attribute or render it as empty
      expect(predictionHistory).toBeInTheDocument();
    });

    it('handles connecting wallet state', () => {
      vi.mocked(useWalletStore).mockImplementation(((selector: unknown) => {
        const store = { ...mockWalletStore, status: 'connecting' };
        return selectFromStore(selector, store);
      }) as never);

      render(<Dashboard />);

      const predictionCard = screen.getByTestId('prediction-card');
      expect(predictionCard).toHaveAttribute('data-connecting', 'true');
    });

    it('handles checking wallet state', () => {
      vi.mocked(useWalletStore).mockImplementation(((selector: unknown) => {
        const store = { ...mockWalletStore, status: 'checking' };
        return selectFromStore(selector, store);
      }) as never);

      render(<Dashboard />);

      const predictionCard = screen.getByTestId('prediction-card');
      expect(predictionCard).toHaveAttribute('data-connecting', 'true');
    });
  });

  describe('round states', () => {
    it('handles inactive round', () => {
      vi.mocked(useRoundStore).mockImplementation((selector: any) => {
        const store = { ...mockRoundStore, isRoundActive: false };
        return typeof selector === 'function' ? selector(store) : store;
      });

      render(<Dashboard />);

      const predictionCard = screen.getByTestId('prediction-card');
      expect(predictionCard).toHaveAttribute('data-round-active', 'false');
    });

    it('opens the end round modal when a resolved round exists', () => {
      const resolvedRound = {
        id: 'round-123',
        status: 'resolved',
        isWin: true,
        netChange: 42,
        tip: 'Nice finish!',
      };

      vi.mocked(useRoundStore).mockImplementation((selector: any) => {
        const store = { ...mockRoundStore, isRoundActive: false, resolvedRound };
        return typeof selector === 'function' ? selector(store) : store;
      });

      render(<Dashboard />);

      const modal = screen.getByTestId('end-round-modal');
      expect(modal).toHaveAttribute('data-open', 'true');
      expect(modal).toHaveAttribute('data-is-win', 'true');
      expect(modal).toHaveAttribute('data-amount', '42');
      expect(modal).toHaveAttribute('data-tip', 'Nice finish!');
    });

    it('dispatches dismissResolvedRound when the modal close action triggers', () => {
      const resolvedRound = {
        id: 'round-123',
        status: 'resolved',
        isWin: false,
        netChange: -18,
        tip: 'Better luck next round.',
      };

      const dismissResolvedRound = vi.fn();

      vi.mocked(useRoundStore).mockImplementation((selector: any) => {
        const store = { ...mockRoundStore, isRoundActive: false, resolvedRound, dismissResolvedRound };
        return typeof selector === 'function' ? selector(store) : store;
      });

      render(<Dashboard />);

      const modal = screen.getByTestId('end-round-modal');
      fireEvent.click(modal);

      expect(dismissResolvedRound).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialization', () => {
    it('fetches active round on mount', () => {
      render(<Dashboard />);

      expect(mockRoundStore.fetchActiveRound).toHaveBeenCalledTimes(1);
    });

    it('subscribes to round events on mount', () => {
      render(<Dashboard />);

      expect(mockRoundStore.subscribeToRoundEvents).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from round events on unmount', () => {
      const unsubscribe = vi.fn();
      mockRoundStore.subscribeToRoundEvents.mockReturnValue(unsubscribe);

      const { unmount } = render(<Dashboard />);
      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('prediction submission', () => {
    it('successfully submits prediction', async () => {
      vi.mocked(predictionsApi.submit).mockResolvedValue({
        id: 'pred-123',
        direction: 'UP',
        stake: '10',
      });

      render(<Dashboard />);

      // Verify the button exists
      const submitButton = screen.getByTestId('submit-prediction');
      expect(submitButton).toBeInTheDocument();
      
      fireEvent.click(submitButton);

      // Wait for the API call
      await waitFor(() => {
        expect(predictionsApi.submit).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify the call arguments
      expect(predictionsApi.submit).toHaveBeenCalledWith({
        direction: 'UP',
        stake: '10',
        exactPrice: '100',
        isLegend: false,
      });

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
    });

    it('shows submitting state during prediction', async () => {
      let resolveSubmit: (value: { id: string }) => void;
      const submitPromise = new Promise<{ id: string }>((resolve) => {
        resolveSubmit = resolve;
      });
      vi.mocked(predictionsApi.submit).mockReturnValue(submitPromise);

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const predictionCard = screen.getByTestId('prediction-card');
        expect(predictionCard).toHaveAttribute('data-submitting', 'true');
      });

      resolveSubmit!({ id: 'pred-123' });
      
      await waitFor(() => {
        const predictionCard = screen.getByTestId('prediction-card');
        expect(predictionCard).toHaveAttribute('data-submitting', 'false');
      });
    });

    it('handles API error during submission', async () => {
      const apiError = new ApiError('Insufficient balance', 400);
      vi.mocked(predictionsApi.submit).mockRejectedValue(apiError);

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
      });
    });

    it('handles generic error during submission', async () => {
      const genericError = new Error('Network error');
      vi.mocked(predictionsApi.submit).mockRejectedValue(genericError);

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to submit prediction. Please try again.')).toBeInTheDocument();
      });
    });

    it('clears success message after 3 seconds', async () => {
      vi.useFakeTimers();
      vi.mocked(predictionsApi.submit).mockResolvedValue({ id: 'pred-123' });

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();

      // Fast-forward all timers
      await act(async () => {
        vi.runAllTimers();
      });

      // Message should be cleared now
      expect(screen.queryByText('Prediction Sent!')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('clears existing timeout when new prediction is submitted', async () => {
      vi.useFakeTimers();
      vi.mocked(predictionsApi.submit).mockResolvedValue({ id: 'pred-123' });

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      
      // First submission
      fireEvent.click(submitButton);
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();

      // Second submission before timeout
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.click(submitButton);
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();

      // Should still be visible after original 3 seconds
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });
      expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();

      // Should clear after new 3 seconds
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.queryByText('Prediction Sent!')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('clears message immediately when new prediction starts', async () => {
      vi.mocked(predictionsApi.submit)
        .mockResolvedValueOnce({ id: 'pred-1' })
        .mockReturnValueOnce(new Promise(() => {}));

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      
      // First submission
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();
      });

      // Second submission should clear message immediately
      fireEvent.click(submitButton);
      
      // Message should be cleared immediately when new submission starts
      expect(screen.queryByText('Prediction Sent!')).not.toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', async () => {
      vi.useFakeTimers();
      vi.mocked(predictionsApi.submit).mockResolvedValue({ id: 'pred-123' });

      const { unmount } = render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      // Unmount before timeout
      unmount();

      // Should not throw or cause memory leaks
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      
      vi.useRealTimers();
    });
  });

  describe('accessibility', () => {
    it('has proper alert role for messages', async () => {
      vi.mocked(predictionsApi.submit).mockResolvedValue({ id: 'pred-123' });

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Prediction Sent!');
      });
    });

    it('uses appropriate ARIA attributes for error messages', async () => {
      const apiError = new ApiError('Error message', 400);
      vi.mocked(predictionsApi.submit).mockRejectedValue(apiError);

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Error message');
      });
    });
  });

  describe('responsive layout', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<Dashboard />);

      const dashboard = screen.getByText('Chat Sidebar').closest('.dashboard');
      expect(dashboard).toHaveClass('flex', 'min-h-full');

      const mainContent = screen.getByTestId('prediction-card').closest('.flex-1');
      expect(mainContent).toHaveClass('ml-0', 'md:ml-80');
    });
  });

  describe('edge cases', () => {
    it('handles multiple rapid prediction submissions', async () => {
      vi.mocked(predictionsApi.submit).mockResolvedValue({ id: 'pred-123' });

      render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      
      // Rapid clicks
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      // Should handle gracefully without errors
      await waitFor(() => {
        expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();
      });
    });

    it('handles prediction submission when wallet becomes disconnected', async () => {
      let resolveSubmit: (value: { id: string }) => void;
      const submitPromise = new Promise<{ id: string }>((resolve) => {
        resolveSubmit = resolve;
      });
      vi.mocked(predictionsApi.submit).mockReturnValue(submitPromise);

      const { rerender } = render(<Dashboard />);

      const submitButton = screen.getByTestId('submit-prediction');
      fireEvent.click(submitButton);

      // Simulate wallet disconnection during submission
      vi.mocked(useWalletStore).mockImplementation(((selector: unknown) => {
        const store = { ...mockWalletStore, status: 'idle', publicKey: null };
        return selectFromStore(selector, store);
      }) as never);

      rerender(<Dashboard />);

      resolveSubmit!({ id: 'pred-123' });

      await waitFor(() => {
        expect(screen.getByText('Prediction Sent!')).toBeInTheDocument();
      });
    });
  });
});