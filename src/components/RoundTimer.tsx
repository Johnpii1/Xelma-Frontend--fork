import { useState, useEffect } from 'react';

interface RoundTimerProps {
  playersOnline?: number;
}

const RoundTimer: React.FC<RoundTimerProps> = ({ playersOnline = 128 }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const totalTime = 60;
  const progress = (timeLeft / totalTime) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* Circular Progress Timer */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(#4CAF50 0deg ${(progress / 100) * 360}deg, #e0e0e0 ${(progress / 100) * 360}deg 360deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {timeLeft}
      </div>

      {/* Players Online Label */}
      <p style={{ margin: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#555' }}>
        Playing now: {playersOnline}
      </p>
    </div>
  );
};

export default RoundTimer;
