import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { ordersApi, paymentsApi } from '../lib/resources';
import { openRazorpayCheckout } from '../lib/razorpay';
import './Checkout.css';

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'];

const emptyAddress = { fullName: '', phone: '', email: '', line1: '', city: '', state: '', pincode: '', country: 'India' };

export default function Checkout() {
  const { cart, cartSubtotal, user, appliedCoupon, clearCart, clearCoupon, showError } = useStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [shipMethod, setShipMethod] = useState('standard');
  const [payMethod, setPayMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const shippingCost = shipMethod === 'express' ? 999 : (cartSubtotal > 15000 ? 0 : 499);
  const discountAmount = appliedCoupon?.discount || 0;
  const total = Math.max(0, cartSubtotal - discountAmount) + shippingCost;

  function updateField(field, val) {
    setAddress((a) => ({ ...a, [field]: val }));
  }

  function addressValid() {
    return address.fullName && address.phone && address.line1 && address.city && address.pincode;
  }

  async function placeOrder() {
    setPlacing(true);
    setFormError('');
    try {
      const res = await ordersApi.create({
        items: cart.map((i) => ({ product: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        shippingAddress: address,
        shippingMethod: shipMethod,
        paymentMethod: payMethod,
        couponCode: appliedCoupon?.code,
        discountAmount,
      });
      const order = res.data;

      if (payMethod !== 'cod') {
        const { data: status } = await paymentsApi.status();
        if (!status.configured) {
          throw new Error('Online payment is not set up yet — please choose Cash on Delivery.');
        }
        const { data: rp } = await paymentsApi.createOrder(order._id);
        const result = await openRazorpayCheckout({
          keyId: rp.keyId,
          amount: rp.amount,
          currency: rp.currency,
          razorpayOrderId: rp.razorpayOrderId,
          orderNumber: rp.orderNumber,
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        });
        await paymentsApi.verify({ orderId: order._id, ...result });
      }

      clearCart();
      clearCoupon();
      navigate('/order-confirmation', { state: { orderNumber: order.orderNumber } });
    } catch (err) {
      showError(err, 'Could not place your order — please try again');
      setFormError(err.message || 'Could not place your order');
    } finally {
      setPlacing(false);
    }
  }

  function next() {
    if (step === 0 && !addressValid()) {
      setFormError('Please fill in name, phone, address, city and pincode.');
      return;
    }
    setFormError('');
    if (step === STEPS.length - 1) {
      placeOrder();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <>
      <PageHeader crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} title="Checkout" />

      <div className="section checkout-section">
        <div className="container checkout-layout">
          <div className="checkout-main">
            <div className="checkout-steps">
              {STEPS.map((s, i) => (
                <div key={s} className={`checkout-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  <span className="checkout-step-num">{i < step ? '✓' : i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <div className="checkout-panel card">
              {step === 0 && (
                <div className="checkout-form">
                  {!user && (
                    <div className="checkout-guest-toggle">
                      <button className="active">Guest Checkout</button>
                      <button onClick={() => navigate('/login', { state: { from: '/checkout' } })}>Sign In Instead</button>
                    </div>
                  )}
                  <div className="checkout-grid">
                    <input placeholder="Full Name" value={address.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                    <input placeholder="Phone Number" value={address.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    <input placeholder="Email Address" className="span-2" value={address.email} onChange={(e) => updateField('email', e.target.value)} />
                    <input placeholder="Address Line 1" className="span-2" value={address.line1} onChange={(e) => updateField('line1', e.target.value)} />
                    <input placeholder="City" value={address.city} onChange={(e) => updateField('city', e.target.value)} />
                    <input placeholder="State" value={address.state} onChange={(e) => updateField('state', e.target.value)} />
                    <input placeholder="PIN Code" value={address.pincode} onChange={(e) => updateField('pincode', e.target.value)} />
                    <input placeholder="Country" value={address.country} onChange={(e) => updateField('country', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="checkout-form">
                  <label className={`checkout-radio ${shipMethod === 'standard' ? 'active' : ''}`}>
                    <input type="radio" checked={shipMethod === 'standard'} onChange={() => setShipMethod('standard')} />
                    <div><strong>Standard Shipping</strong><span>3–6 business days · {cartSubtotal > 15000 ? 'Free' : rupee(499)}</span></div>
                  </label>
                  <label className={`checkout-radio ${shipMethod === 'express' ? 'active' : ''}`}>
                    <input type="radio" checked={shipMethod === 'express'} onChange={() => setShipMethod('express')} />
                    <div><strong>Express Shipping</strong><span>1–2 business days · {rupee(999)}</span></div>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="checkout-form">
                  {['card', 'upi', 'cod'].map((m) => (
                    <label key={m} className={`checkout-radio ${payMethod === m ? 'active' : ''}`}>
                      <input type="radio" checked={payMethod === m} onChange={() => setPayMethod(m)} />
                      <div>
                        <strong>{m === 'card' ? 'Credit / Debit Card' : m === 'upi' ? 'UPI' : 'Cash on Delivery'}</strong>
                        <span>{m === 'card' ? 'Visa, Mastercard, RuPay accepted' : m === 'upi' ? 'GPay, PhonePe, Paytm' : 'Pay when your order arrives'}</span>
                      </div>
                    </label>
                  ))}
                  <div className="checkout-secure">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16v10H4z" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></svg>
                    256-bit SSL secured · PCI-DSS compliant payment gateway
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="checkout-review">
                  {cart.map((item) => (
                    <div className="checkout-review-row" key={item.id}>
                      <span>{item.name} × {item.qty}</span>
                      <span>{rupee(item.price * item.qty)}</span>
                    </div>
                  ))}
                  {appliedCoupon && (
                    <div className="checkout-review-row"><span>Coupon ({appliedCoupon.code})</span><span>−{rupee(discountAmount)}</span></div>
                  )}
                  <div className="checkout-review-row"><span>Shipping ({shipMethod})</span><span>{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</span></div>
                  <div className="checkout-review-row"><span>Payment Method</span><span style={{ textTransform: 'capitalize' }}>{payMethod}</span></div>
                  <div className="checkout-review-row"><span>Deliver To</span><span>{address.fullName}, {address.city} {address.pincode}</span></div>
                </div>
              )}

              {formError && <p className="cart-coupon-msg" style={{ color: '#b42828' }}>{formError}</p>}

              <div className="checkout-actions">
                {step > 0 && <button className="btn btn-outline on-light" onClick={() => setStep((s) => s - 1)} disabled={placing}>Back</button>}
                <button className="btn btn-gold" onClick={next} disabled={placing || cart.length === 0}>
                  {placing ? 'Placing Order…' : step === STEPS.length - 1 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </div>
          </div>

          <aside className="checkout-summary card">
            <h3>Order Summary</h3>
            {cart.map((item) => (
              <div className="checkout-summary-row" key={item.id}><span>{item.name} × {item.qty}</span><span>{rupee(item.price * item.qty)}</span></div>
            ))}
            {appliedCoupon && <div className="checkout-summary-row"><span>Coupon ({appliedCoupon.code})</span><span>−{rupee(discountAmount)}</span></div>}
            <div className="checkout-summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</span></div>
            <div className="cart-summary-total"><span>Total</span><span>{rupee(total)}</span></div>
          </aside>
        </div>
      </div>
    </>
  );
}
