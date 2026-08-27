import { useEffect, useState } from 'react';

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now());
  return {
    h: Math.floor(diff / 3.6e6),
    m: Math.floor((diff % 3.6e6) / 6e4),
    s: Math.floor((diff % 6e4) / 1000),
  };
}

export default function CountdownTimer({ hours = 8, endsAt }) {
  // If the admin has set a real Flash Sale end date/time, count down to that —
  // but only if it's a valid date AND still in the future. Otherwise fall back
  // to a rolling "N hours from now" timer instead of freezing at 00:00:00.
  const [target] = useState(() => {
    const parsed = endsAt ? new Date(endsAt).getTime() : NaN;
    const isValidFuture = !Number.isNaN(parsed) && parsed > Date.now();
    return isValidFuture ? parsed : Date.now() + hours * 3.6e6;
  });

  const [t, setT] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setT(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown">
      {[['H', t.h], ['M', t.m], ['S', t.s]].map(([label, v]) => (
        <div className="countdown-cell" key={label}>
          <span className="countdown-num">{pad(v)}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}