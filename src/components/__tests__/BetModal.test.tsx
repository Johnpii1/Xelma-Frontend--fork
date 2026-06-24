import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BetModal from '../BetModal';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthStore } from '../../store/useAuthStore';
import { place_bet, place_precision_prediction } from '../../lib/xelma-contract';
import { predictionsApi } from '../../lib/api-client';

// Mock the contracts module
vi.mock('../../lib/xelma-contract', () => ({
  place_bet: vi.fn(),
  place_precision_prediction: vi.fn(),
}));

// Mock the api-client module
vi.mock('../../lib/api-client', () => ({
  predictionsApi: {
    submit: vi.fn(),
  },
}));

describe('BetModal Component', () => {
  const defaultPrediction = {
    direction: 'UP' as const,
    stake: '15',
    isLegend: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default stores to connected and authenticated
    useWalletStore.setState({
      status: 'connected',
      publicKey: 'GUSER123',
    });
    useAuthStore.setState({
      isAuthenticated: true,
    });
  });

  it('does not render when closed', () => {
    const { container } = render(
      <BetModal isOpen={false} onClose={vi.fn()} predictionData={defaultPrediction} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders confirmation screen with correct prediction details when open', () => {
    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={defaultPrediction} />
    );

    expect(screen.getByText('Confirm Prediction')).toBeInTheDocument();
    expect(screen.getByText('UP/DOWN Match')).toBeInTheDocument();
    expect(screen.getByText('UP')).toBeInTheDocument();
    expect(screen.getByText('15 XLM')).toBeInTheDocument();
  });

  it('renders precision prediction details when isLegend is true', () => {
    const legendPrediction = {
      direction: 'DOWN' as const,
      stake: '50',
      isLegend: true,
      exactPrice: '0.2295',
    };

    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={legendPrediction} />
    );

    expect(screen.getByText('Legend Mode (Precision)')).toBeInTheDocument();
    expect(screen.getByText('DOWN')).toBeInTheDocument();
    expect(screen.getByText('50 XLM')).toBeInTheDocument();
    expect(screen.getByText('$0.2295')).toBeInTheDocument();
  });

  it('prompts wallet connection and authentication if user is not connected', () => {
    // Set wallet to disconnected
    useWalletStore.setState({
      status: 'idle',
      publicKey: null,
    });

    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={defaultPrediction} />
    );

    expect(screen.getByText('Wallet & Auth Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect & Authenticate' })).toBeInTheDocument();
  });

  it('executes smart contract and backend submit on confirmation', async () => {
    vi.mocked(place_bet).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return {
        txHash: 'tx_hash_123',
        ledger: 456,
      };
    });
    vi.mocked(predictionsApi.submit).mockResolvedValue({
      id: 1,
    } as any);

    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={defaultPrediction} />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);

    // Verify loading state is shown
    expect(await screen.findByText('Preparing Transaction...')).toBeInTheDocument();

    await waitFor(() => {
      expect(place_bet).toHaveBeenCalledWith('GUSER123', 'UP', '15', expect.any(Function));
      expect(predictionsApi.submit).toHaveBeenCalledWith({
        direction: 'UP',
        stake: '15',
        isLegend: false,
        exactPrice: undefined,
      });
      expect(screen.getByText('Prediction Submitted!')).toBeInTheDocument();
      expect(screen.getByText('View on StellarExpert')).toBeInTheDocument();
    });
  });

  it('triggers place_precision_prediction for legend predictions', async () => {
    const legendPrediction = {
      direction: 'DOWN' as const,
      stake: '10',
      isLegend: true,
      exactPrice: '1.25',
    };

    vi.mocked(place_precision_prediction).mockResolvedValue({
      txHash: 'tx_hash_legend',
      ledger: 789,
    });

    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={legendPrediction} />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(place_precision_prediction).toHaveBeenCalledWith('GUSER123', 'DOWN', '10', '1.25', expect.any(Function));
      expect(screen.getByText('Prediction Submitted!')).toBeInTheDocument();
    });
  });

  it('displays error and allows retry if smart contract fails', async () => {
    vi.mocked(place_bet).mockRejectedValue(new Error('User rejected Freighter signature'));

    render(
      <BetModal isOpen={true} onClose={vi.fn()} predictionData={defaultPrediction} />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getAllByText('Transaction Failed')[0]).toBeInTheDocument();
      expect(screen.getByText('User rejected Freighter signature')).toBeInTheDocument();
    });

    // Retry should be visible
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();
  });
});
