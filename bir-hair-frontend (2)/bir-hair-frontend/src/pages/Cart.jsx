import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import TrustBadges from '../components/TrustBadges';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartSubtotal, cartMrpTotal, appliedCoupon, applyCoupon, clearCoupon, showError } = useStore();
  const [coupon, setCoupon] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const discount = cartMrpTotal - cartSubtotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const shipping = cart.length === 0 ? 0 : (cartSubtotal > 15000 ? 0 : 499);
  const total = Math.max(0, cartSubtotal - couponDiscount) + shipping;

  async function handleApply() {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(coupon.trim(), cartSubtotal);
    } catch (err) {
      clearCoupon();
      showError(err, 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <PageHeader crumbs={[{ label: 'Cart' }]} title="Your Cart" lede={`${cart.length} item${cart.length !== 1 ? 's' : ''} selected for checkout.`} />

      <div className="section cart-section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-state-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
                  <circle cx="10" cy="21" r="1.4" fill="currentColor" /><circle cx="18" cy="21" r="1.4" fill="currentColor" />
                </svg>
              </div>
              <h3>Your cart is waiting</h3>
              <p>Time to add some factory-direct hair to it.</p>
              <Link to="/shop" className="btn btn-gold">Start Shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item card" key={item.id}>
                    <div className="cart-item-img">
                      <PhotoBlock tone={item.tone} ratio="1/1" rounded={14} strands={false} src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-info">
                      <Link to={`/product/${item.id}`}><h4>{item.name}</h4></Link>
                      <span className="cart-item-variant">{item.hairType} · {item.length}" · {item.color}</span>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">
                      <span className="price-now">{rupee(item.price * item.qty)}</span>
                      {item.mrp > item.price && <span className="price-strike">{rupee(item.mrp * item.qty)}</span>}
                    </div>
                  </div>
                ))}
                <Link to="/shop" className="cart-continue">← Continue Shopping</Link>
              </div>

              <aside className="cart-summary card">
                <h3>Order Summary</h3>
                <div className="cart-coupon">
                  <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                  <button className="btn btn-dark btn-sm" onClick={handleApply} disabled={applying}>
                    {applying ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="cart-coupon-msg success">
                    {appliedCoupon.code} applied — −{rupee(appliedCoupon.discount)}{' '}
                    <button className="cart-item-remove" style={{ marginLeft: 8 }} onClick={() => { clearCoupon(); setCoupon(''); }}>Remove</button>
                  </p>
                )}

                <div className="cart-summary-row"><span>Subtotal</span><span>{rupee(cartSubtotal)}</span></div>
                {discount > 0 && <div className="cart-summary-row discount"><span>Bundle Savings</span><span>−{rupee(discount)}</span></div>}
                {appliedCoupon && <div className="cart-summary-row discount"><span>Coupon ({appliedCoupon.code})</span><span>−{rupee(couponDiscount)}</span></div>}
                <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : rupee(shipping)}</span></div>
                <div className="cart-summary-total"><span>Total</span><span>{rupee(total)}</span></div>

                <button className="btn btn-gold cart-checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>

                <TrustBadges
                  className="cart-trust"
                  items={[
                    { icon: 'lock', title: 'Secure Checkout', sub: 'SSL encrypted' },
                    { icon: 'truck', title: 'Ships in 24 Hrs', sub: 'From Delhi' },
                    { icon: 'refresh', title: '7-Day Returns', sub: 'Hassle free' },
                  ]}
                />
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
