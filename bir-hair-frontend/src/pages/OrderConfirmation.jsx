import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { FiExternalLink } from 'react-icons/fi';

export default function OrderConfirmation() {
  const location = useLocation();

  const fallbackId = useMemo(
    () =>
      `BIR-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
    []
  );

  const orderId =
    location.state?.orderNumber || fallbackId;

  // Present only when the customer chose
  // "Pay Online (Bluevine)" at checkout.
  const paymentMethod =
    location.state?.paymentMethod;

  const paymentLink =
    location.state?.paymentLink;

  const amount =
    location.state?.amount;

  const isOnlinePayment =
    paymentMethod === 'online' &&
    Boolean(paymentLink);

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        color:
          i % 2 === 0
            ? 'var(--gold)'
            : 'var(--champagne)',
      })),
    []
  );

  return (
    <div className="oc-wrap">
      {/* CONFETTI */}
      <div className="oc-confetti">
        {confetti.map((c) => (
          <span
            key={c.id}
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              background: c.color,
            }}
          />
        ))}
      </div>

      <div className="container oc-inner">
        {/* SUCCESS ICON */}
        <div className="oc-check">✓</div>

        <h1>Order Confirmed</h1>

        <p>
          Thank you — your order has been placed and
          our Delhi factory is preparing it for
          dispatch.
        </p>

        {/* ORDER ID */}
        <div className="oc-id card">
          <span className="eyebrow">
            Order ID
          </span>

          <strong>{orderId}</strong>
        </div>

        {/* ONLINE PAYMENT */}
        {isOnlinePayment && (
          <div
            className="card"
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              border:
                '1px solid rgba(201,162,39,0.35)',
            }}
          >
            <span className="eyebrow">
              Complete Your Payment
            </span>

            <p
              style={{
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              Your order is currently{' '}
              <strong>Pending / Unpaid</strong>.
              Please pay
              {amount
                ? ` ₹${Number(
                    amount
                  ).toLocaleString('en-IN')}`
                : ''}{' '}
              using the secure Bluevine Payment
              Link below. Once we confirm your
              payment, we'll update your order
              status.
            </p>

            {/* FIXED: missing <a> opening tag */}
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              Pay Now via Bluevine
              <FiExternalLink size={14} />
            </a>

            <p
              style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                opacity: 0.75,
              }}
            >
              Please mention your Order ID (
              <strong>{orderId}</strong>) as a
              reference/note if the payment page
              allows it, so we can match your
              payment quickly.
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="oc-actions">
          <Link
            to="/account"
            className="btn btn-gold"
          >
            Track Your Order
          </Link>

          <Link
            to="/shop"
            className="btn btn-outline on-light"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}