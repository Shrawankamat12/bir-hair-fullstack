import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTruck, FiCreditCard, FiSmartphone, FiPackage, FiLock, FiMapPin, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { ordersApi, paymentsApi } from '../lib/resources';
import { openRazorpayCheckout } from '../lib/razorpay';
import { resolveImageUrl } from '../lib/api';

const STEPS = [
  { label: 'Address', icon: FiMapPin },
  { label: 'Shipping', icon: FiTruck },
  { label: 'Payment', icon: FiCreditCard },
  { label: 'Review', icon: FiPackage },
];

const emptyAddress = { fullName: '', phone: '', email: '', line1: '', city: '', state: '', pincode: '', country: 'India' };

export default function Checkout() {
  const { cart, cartSubtotal, cartMrpTotal, user, appliedCoupon, clearCart, clearCoupon, showError } = useStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [shipMethod, setShipMethod] = useState('standard');
  const [payMethod, setPayMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const navigate = useNavigate();

  // Normalize saved addresses from whatever shape the user object has —
  // supports either a `user.addresses` array or a single `user.address` object.
  const savedAddresses = user?.addresses?.length
    ? user.addresses
    : user?.address
    ? [{ id: 'default', ...user.address }]
    : [];

  useEffect(() => {
    if (savedAddresses.length === 1) {
      applySavedAddress(savedAddresses[0]);
    } else if (savedAddresses.length === 0) {
      setShowNewForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function applySavedAddress(saved) {
    setAddress({
      fullName: saved.fullName || user?.name || '',
      phone: saved.phone || '',
      email: saved.email || user?.email || '',
      line1: saved.line1 || saved.address1 || '',
      city: saved.city || '',
      state: saved.state || '',
      pincode: saved.pincode || saved.zip || '',
      country: saved.country || 'India',
    });
    setSelectedSavedId(saved.id || saved._id || 'default');
    setShowNewForm(false);
  }

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
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
        items: cart.map((i) => {
          const unitPrice = i.mrp && i.mrp > i.price ? i.mrp : i.price;
          const discountPerUnit = unitPrice - i.price;
          return {
            productId: i.id,
            productName: i.name,
            sku: i.sku || i.id,
            image: i.image,
            variant: {
              length: i.length ? `${i.length} inch` : undefined,
              colour: i.color || undefined,
              texture: i.hairType || undefined,
            },
            quantity: i.qty,
            unitPrice,
            discount: discountPerUnit * i.qty,
            finalPrice: i.price,
            total: i.price * i.qty,
          };
        }),
        billingAddress: { ...address, line2: address.line2 || '', landmark: address.landmark || '' },
        shippingAddress: { ...address, line2: address.line2 || '', landmark: address.landmark || '' },
        pricing: {
          subtotal: cartMrpTotal,
          productDiscount: cartMrpTotal - cartSubtotal,
          couponDiscount: discountAmount,
          shippingCharge: shippingCost,
          tax: 0,
          grandTotal: total,
        },
        payment: { method: payMethod },
        shipping: { method: shipMethod },
        couponCode: appliedCoupon?.code,
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
      console.error('Place order failed:', err);
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

      <div className="section" style={{ paddingTop: 20 }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            {/* ===================== MAIN COLUMN ===================== */}
            <div>
              {/* Steps indicator */}
              <div className="mb-6 flex items-center justify-between">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  const done = i < step;
                  return (
                    <div key={s.label} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                            done
                              ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white'
                              : active
                              ? 'bg-gradient-to-br from-[#f58bb1] to-[#e22467] text-white shadow-[0_6px_16px_rgba(226,36,103,0.35)]'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {done ? <FiCheck size={16} /> : <Icon size={15} />}
                        </span>
                        <span className={`text-[11px] font-medium ${active ? 'text-[#ef6c9d]' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`mx-2 h-[2px] flex-1 rounded transition-colors duration-300 ${done ? 'bg-[#ef6c9d]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Panel */}
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(226,36,103,0.25)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* ============ STEP 0 — ADDRESS ============ */}
                    {step === 0 && (
                      <div>
                        {!user && (
                          <div className="mb-5 flex gap-2 rounded-full bg-[#fff5f8] p-1">
                            <button className="flex-1 rounded-full bg-white py-2 text-sm font-semibold text-gray-900 shadow-sm">
                              Guest Checkout
                            </button>
                            <button
                              onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                              className="flex-1 rounded-full py-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#ef6c9d]"
                            >
                              Sign In Instead
                            </button>
                          </div>
                        )}

                        {/* Saved addresses (only if user has any) */}
                        {savedAddresses.length > 0 && (
                          <div className="mb-5">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Saved Address{savedAddresses.length > 1 ? 'es' : ''}
                            </h4>
                            <div className="flex flex-col gap-2">
                              {savedAddresses.map((saved) => {
                                const id = saved.id || saved._id || 'default';
                                const isSelected = selectedSavedId === id && !showNewForm;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => applySavedAddress(saved)}
                                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                                      isSelected
                                        ? 'border-[#ef6c9d] bg-[#fff5f8] shadow-[0_4px_14px_rgba(226,36,103,0.15)]'
                                        : 'border-gray-200 hover:border-[#f8b4ca]'
                                    }`}
                                  >
                                    <span
                                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        isSelected ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white' : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      <FiMapPin size={14} />
                                    </span>
                                    <span className="flex-1">
                                      <span className="block text-sm font-semibold text-gray-900">
                                        {saved.fullName || user?.name || 'Saved address'}
                                      </span>
                                      <span className="block text-xs text-gray-500">
                                        {saved.line1 || saved.address1}, {saved.city} {saved.pincode || saved.zip}
                                      </span>
                                    </span>
                                    {isSelected && <FiCheck className="mt-1 shrink-0 text-[#ef6c9d]" />}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => { setShowNewForm(true); setSelectedSavedId(null); setAddress(emptyAddress); }}
                                className={`flex items-center justify-between rounded-xl border border-dashed p-3 text-left text-sm font-medium transition-colors ${
                                  showNewForm ? 'border-[#ef6c9d] bg-[#fff5f8] text-[#ef6c9d]' : 'border-gray-200 text-gray-500 hover:border-[#f8b4ca] hover:text-[#ef6c9d]'
                                }`}
                              >
                                Use a new address
                                <FiChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Address form (new address or no saved ones) */}
                        {showNewForm && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field placeholder="Full Name" value={address.fullName} onChange={(v) => updateField('fullName', v)} />
                            <Field placeholder="Phone Number" value={address.phone} onChange={(v) => updateField('phone', v)} />
                            <Field className="sm:col-span-2" placeholder="Email Address" value={address.email} onChange={(v) => updateField('email', v)} />
                            <Field className="sm:col-span-2" placeholder="Address Line 1" value={address.line1} onChange={(v) => updateField('line1', v)} />
                            <Field placeholder="City" value={address.city} onChange={(v) => updateField('city', v)} />
                            <Field placeholder="State" value={address.state} onChange={(v) => updateField('state', v)} />
                            <Field placeholder="PIN Code" value={address.pincode} onChange={(v) => updateField('pincode', v)} />
                            <Field placeholder="Country" value={address.country} onChange={(v) => updateField('country', v)} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* ============ STEP 1 — SHIPPING ============ */}
                    {step === 1 && (
                      <div className="flex flex-col gap-3">
                        <RadioCard
                          active={shipMethod === 'standard'}
                          onClick={() => setShipMethod('standard')}
                          title="Standard Shipping"
                          sub={`3–6 business days · ${cartSubtotal > 15000 ? 'Free' : rupee(499)}`}
                          icon={FiTruck}
                        />
                        <RadioCard
                          active={shipMethod === 'express'}
                          onClick={() => setShipMethod('express')}
                          title="Express Shipping"
                          sub={`1–2 business days · ${rupee(999)}`}
                          icon={FiPackage}
                        />
                      </div>
                    )}

                    {/* ============ STEP 2 — PAYMENT ============ */}
                    {step === 2 && (
                      <div className="flex flex-col gap-3">
                        <RadioCard
                          active={payMethod === 'card'}
                          onClick={() => setPayMethod('card')}
                          title="Credit / Debit Card"
                          sub="Visa, Mastercard, RuPay accepted"
                          icon={FiCreditCard}
                        />
                        <RadioCard
                          active={payMethod === 'upi'}
                          onClick={() => setPayMethod('upi')}
                          title="UPI"
                          sub="GPay, PhonePe, Paytm"
                          icon={FiSmartphone}
                        />
                        <RadioCard
                          active={payMethod === 'cod'}
                          onClick={() => setPayMethod('cod')}
                          title="Cash on Delivery"
                          sub="Pay when your order arrives"
                          icon={FiPackage}
                        />
                        <div className="mt-1 flex items-center gap-2 rounded-lg bg-[#fff5f8] px-3 py-2.5 text-xs text-gray-500">
                          <FiLock className="text-[#ef6c9d]" size={13} />
                          256-bit SSL secured · PCI-DSS compliant payment gateway
                        </div>
                      </div>
                    )}

                    {/* ============ STEP 3 — REVIEW ============ */}
                    {step === 3 && (
                      <div className="divide-y divide-gray-100 text-sm">
                        {cart.map((item) => (
                          <div className="flex justify-between py-2.5 text-gray-600" key={item.id}>
                            <span>{item.name} × {item.qty}</span>
                            <span className="font-medium text-gray-900">{rupee(item.price * item.qty)}</span>
                          </div>
                        ))}
                        {appliedCoupon && (
                          <div className="flex justify-between py-2.5 text-[#ef6c9d]">
                            <span>Coupon ({appliedCoupon.code})</span>
                            <span>−{rupee(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2.5 text-gray-600">
                          <span>Shipping ({shipMethod})</span>
                          <span className="font-medium text-gray-900">{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</span>
                        </div>
                        <div className="flex justify-between py-2.5 text-gray-600">
                          <span>Payment Method</span>
                          <span className="font-medium capitalize text-gray-900">{payMethod}</span>
                        </div>
                        <div className="flex justify-between py-2.5 text-gray-600">
                          <span>Deliver To</span>
                          <span className="font-medium text-gray-900">{address.fullName}, {address.city} {address.pincode}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {formError && (
                  <p className="mt-4 rounded-lg bg-[#fff0f4] px-3 py-2 text-xs font-medium text-[#c81e5c]">{formError}</p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      disabled={placing}
                      className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#ef6c9d] hover:text-[#ef6c9d] disabled:opacity-50"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={next}
                    disabled={placing || cart.length === 0}
                    className="rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.3)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {placing ? 'Placing Order…' : step === STEPS.length - 1 ? 'Place Order' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>

            {/* ===================== COMPACT ORDER SUMMARY ===================== */}
            <aside className="h-fit rounded-2xl border border-black/5 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
              <h3 className="mb-3 text-sm font-bold text-gray-900">Order Summary</h3>
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1 text-xs">
                {cart.map((item) => (
                  <div className="flex items-center gap-2.5" key={item.id}>
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#fff5f8]">
                      {item.image ? (
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                    </div>
                    <span className="flex-1 truncate text-gray-500">{item.name} × {item.qty}</span>
                    <span className="shrink-0 font-medium text-gray-800">{rupee(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 text-xs">
                {appliedCoupon && (
                  <div className="flex justify-between text-[#ef6c9d]">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>−{rupee(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : rupee(shippingCost)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">{rupee(total)}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ placeholder, value, onChange, className = '' }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-xl border border-gray-200 bg-[#fff8fa] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-[#ef6c9d] focus:bg-white focus:outline-none ${className}`}
    />
  );
}

function RadioCard({ active, onClick, title, sub, icon: Icon }) {
  return (
    <label
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
        active ? 'border-[#ef6c9d] bg-[#fff5f8] shadow-[0_4px_14px_rgba(226,36,103,0.15)]' : 'border-gray-200 hover:border-[#f8b4ca]'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Icon size={15} />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{sub}</span>
      </span>
      {active && <FiCheck className="text-[#ef6c9d]" />}
    </label>
  );
}