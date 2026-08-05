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
  // If the admin has set a real Flash Sale end date/time on the product, count down to that.
  // Otherwise fall back to the original rolling "N hours from now" behaviour.
  const [target] = useState(() => (endsAt ? new Date(endsAt).getTime() : Date.now() + hours * 3.6e6));
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
