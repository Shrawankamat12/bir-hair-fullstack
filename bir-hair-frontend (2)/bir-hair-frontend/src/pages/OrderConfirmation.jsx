import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export default function OrderConfirmation() {
  const location = useLocation();
  const fallbackId = useMemo(() => `BIR-${Math.floor(100000 + Math.random() * 900000)}`, []);
  const orderId = location.state?.orderNumber || fallbackId;

  const confetti = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.6, dur: 1.8 + Math.random() * 1.4,
    color: i % 2 === 0 ? 'var(--gold)' : 'var(--champagne)',
  })), []);

  return (
    <div className="oc-wrap">
      <div className="oc-confetti">
        {confetti.map((c) => (
          <span key={c.id} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, background: c.color }} />
        ))}
      </div>
      <div className="container oc-inner">
        <div className="oc-check">✓</div>
        <h1>Order Confirmed</h1>
        <p>Thank you — your order has been placed and our Delhi factory is preparing it for dispatch.</p>
        <div className="oc-id card">
          <span className="eyebrow">Order ID</span>
          <strong>{orderId}</strong>
        </div>
        <div className="oc-actions">
          <Link to="/account" className="btn btn-gold">Track Your Order</Link>
          <Link to="/shop" className="btn btn-outline on-light">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
