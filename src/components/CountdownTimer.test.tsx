import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import CountdownTimer from './CountdownTimer';

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('formats time as MM:SS for multi-minute values', () => {
    render(<CountdownTimer initialSeconds={150} />);

    expect(screen.getByText('2:30')).toBeInTheDocument();
  });

  it('formats time as M:SS when seconds are below 10', () => {
    render(<CountdownTimer initialSeconds={65} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('shows Ended when initialSeconds is zero', () => {
    render(<CountdownTimer initialSeconds={0} />);

    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('shows Ended after the timer expires and calls onExpire once', () => {
    const onExpire = vi.fn();

    vi.useFakeTimers();
    render(<CountdownTimer initialSeconds={2} onExpire={onExpire} />);

    expect(screen.queryByText('Ended')).not.toBeInTheDocument();
    expect(screen.getByText('0:02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0:01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval timers on unmount', () => {
    vi.useFakeTimers();

    const { unmount } = render(<CountdownTimer initialSeconds={10} />);

    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    }).not.toThrow();
  });
});
