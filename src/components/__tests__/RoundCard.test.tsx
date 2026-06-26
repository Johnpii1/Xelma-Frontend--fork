import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoundCard from '../RoundCard';
import type { MockRound } from '../../types';

describe('RoundCard Component', () => {
  const defaultRound: MockRound = {
    id: 1,
    asset: 'BTC',
    mode: 'updown',
    status: 'live',
    startPrice: 67420,
    poolUp: 2500,
    poolDown: 1500,
    closesInSeconds: 150,
  };

  it('renders asset details, mode, reference price, and pool size correctly', () => {
    render(<RoundCard round={defaultRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    expect(screen.getByText('UP/DOWN')).toBeInTheDocument();
    expect(screen.getByText(/reference \$67,420/i)).toBeInTheDocument();
    expect(screen.getByText(/pool: 4,000 vxlm/i)).toBeInTheDocument();
  });

  it('renders UP/DOWN percentage layout for updown mode', () => {
    render(<RoundCard round={defaultRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('UP 63%')).toBeInTheDocument();
    expect(screen.getByText('DOWN 37%')).toBeInTheDocument();
  });

  it('renders forecasts count for precision mode', () => {
    const precisionRound: MockRound = {
      ...defaultRound,
      mode: 'precision',
      totalPool: 4000,
      predictionCount: 15,
    };
    render(<RoundCard round={precisionRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('PRECISION')).toBeInTheDocument();
    expect(screen.getByText('15 forecasts submitted')).toBeInTheDocument();
  });

  it('renders OPEN status when status is new and closesInSeconds is high', () => {
    const newRound: MockRound = {
      ...defaultRound,
      status: 'new',
      closesInSeconds: 200,
    };
    render(<RoundCard round={newRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('renders CLOSING SOON status when closesInSeconds is low', () => {
    const closingRound: MockRound = {
      ...defaultRound,
      closesInSeconds: 80,
    };
    render(<RoundCard round={closingRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('CLOSING SOON')).toBeInTheDocument();
  });

  it('renders LIVE status when closesInSeconds is high and status is live', () => {
    const liveRound: MockRound = {
      ...defaultRound,
      status: 'live',
      closesInSeconds: 200,
    };
    render(<RoundCard round={liveRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders countdown timer formatted text', () => {
    render(<RoundCard round={defaultRound} onSubmitPrediction={vi.fn()} />);

    expect(screen.getByText('2:30')).toBeInTheDocument();
  });

  it('enables the submit button when closesInSeconds > 0', () => {
    render(<RoundCard round={defaultRound} onSubmitPrediction={vi.fn()} />);

    const button = screen.getByRole('button', { name: /submit prediction/i });
    expect(button).toBeEnabled();
  });

  it('disables the submit button when closesInSeconds <= 0', () => {
    const expiredRound: MockRound = {
      ...defaultRound,
      closesInSeconds: 0,
    };
    render(<RoundCard round={expiredRound} onSubmitPrediction={vi.fn()} />);

    const button = screen.getByRole('button', { name: /submit prediction/i });
    expect(button).toBeDisabled();
  });

  it('triggers onSubmitPrediction callback when clicked while enabled', () => {
    const onSubmitPredictionMock = vi.fn();
    render(<RoundCard round={defaultRound} onSubmitPrediction={onSubmitPredictionMock} />);

    const button = screen.getByRole('button', { name: /submit prediction/i });
    fireEvent.click(button);

    expect(onSubmitPredictionMock).toHaveBeenCalledTimes(1);
    expect(onSubmitPredictionMock).toHaveBeenCalledWith(defaultRound);
  });

  it('does not trigger onSubmitPrediction callback when clicked while disabled', () => {
    const onSubmitPredictionMock = vi.fn();
    const expiredRound: MockRound = {
      ...defaultRound,
      closesInSeconds: 0,
    };
    render(<RoundCard round={expiredRound} onSubmitPrediction={onSubmitPredictionMock} />);

    const button = screen.getByRole('button', { name: /submit prediction/i });
    fireEvent.click(button);

    expect(onSubmitPredictionMock).not.toHaveBeenCalled();
  });
});
