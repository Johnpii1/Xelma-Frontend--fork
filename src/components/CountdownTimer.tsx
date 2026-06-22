import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CountdownTimer({
  initialSeconds,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }

    const id = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [seconds, onExpire]);

  const isUrgent = seconds > 0 && seconds < 120;

  return (
    <span
      className={`font-mono text-sm font-semibold tabular-nums ${
        isUrgent ? 'text-amber-400' : 'text-cyan-300'
      } ${className}`}
      aria-live="polite"
    >
      {formatTime(seconds)}
    </span>
  );
}
