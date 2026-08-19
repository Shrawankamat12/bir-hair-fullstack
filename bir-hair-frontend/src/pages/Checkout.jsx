import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiSmartphone,
  FiPackage,
  FiLock,
  FiMapPin,
  FiChevronRight,
  FiGlobe,
  FiBriefcase,
} from 'react-icons/fi';

import PageHeader from '../components/PageHeader';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { ordersApi, paymentsApi } from '../lib/resources';
import { openRazorpayCheckout } from '../lib/razorpay';
import { resolveImageUrl } from '../lib/api';

const STEPS = [
  {
    label: 'Address',
    icon: FiMapPin,
  },
  {
    label: 'Shipping',
    icon: FiTruck,
  },
  {
    label: 'Payment',
    icon: FiCreditCard,
  },
  {
    label: 'Review',
    icon: FiPackage,
  },
];

/*
 * Payment options shown on YOUR checkout page.
 *
 * Razorpay will show the actual payment UI after
 * the customer clicks "Place Order".
 *
 * COD is handled by our store and does not use Razorpay.
 */
const PAYMENT_OPTIONS = [
  {
    id: 'card',
    title: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay, Amex accepted',
    icon: FiCreditCard,
  },
  {
    id: 'upi',
    title: 'UPI',
    sub: 'Google Pay, PhonePe, Paytm, BHIM & more',
    icon: FiSmartphone,
  },
  {
    id: 'netbanking',
    title: 'Netbanking',
    sub: 'All major Indian banks supported',
    icon: FiGlobe,
  },
  {
    id: 'wallet',
    title: 'Wallets',
    sub: 'Available wallets shown by Razorpay',
    icon: FiBriefcase,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    icon: FiPackage,
  },
];

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function Checkout() {
  const {
    cart,
    cartSubtotal,
    cartMrpTotal,
    user,
    appliedCoupon,
    clearCart,
    clearCoupon,
    showError,
  } = useStore();

  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [address, setAddress] = useState(emptyAddress);

  const [shipMethod, setShipMethod] = useState('standard');

  const [payMethod, setPayMethod] = useState('card');

  const [placing, setPlacing] = useState(false);

  const [formError, setFormError] = useState('');

  const [selectedSavedId, setSelectedSavedId] = useState(null);

  const [showNewForm, setShowNewForm] = useState(false);

  /*
   * Saved addresses
   */
  const savedAddresses = user?.addresses?.length
    ? user.addresses
    : user?.address
    ? [{ id: 'default', ...user.address }]
    : [];

  /*
   * Automatically select saved address.
   */
  useEffect(() => {
    if (savedAddresses.length === 1) {
      applySavedAddress(savedAddresses[0]);
    } else if (savedAddresses.length === 0) {
      setShowNewForm(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /*
   * Apply saved address.
   */
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

    setFormError('');
  }

  /*
   * Shipping calculation.
   */
  const shippingCost =
    shipMethod === 'express'
      ? 999
      : cartSubtotal > 15000
      ? 0
      : 15;

  /*
   * Coupon discount.
   */
  const discountAmount = appliedCoupon?.discount || 0;

  /*
   * Final payable amount.
   */
  const total =
    Math.max(0, cartSubtotal - discountAmount) + shippingCost;

  /*
   * Update address field.
   */
  function updateField(field, value) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * Validate address.
   */
  function addressValid() {
    return Boolean(
      address.fullName &&
        address.phone &&
        address.line1 &&
        address.city &&
        address.pincode
    );
  }

  /*
   * Create order + Razorpay payment.
   */
  async function placeOrder() {
    if (placing) return;

    setPlacing(true);
    setFormError('');

    try {
      /*
       * Create our own store order first.
       */
      const res = await ordersApi.create({
        customerName: address.fullName,

        customerEmail: address.email,

        customerPhone: address.phone,

        items: cart.map((item) => {
          const unitPrice =
            item.mrp && item.mrp > item.price
              ? item.mrp
              : item.price;

          const discountPerUnit = unitPrice - item.price;

          return {
            productId: item.id,

            productName: item.name,

            sku: item.sku || item.id,

            image: item.image,

            variant: {
              length: item.length
                ? `${item.length} inch`
                : undefined,

              colour: item.color || undefined,

              texture: item.hairType || undefined,
            },

            quantity: item.qty,

            unitPrice,

            discount: discountPerUnit * item.qty,

            finalPrice: item.price,

            total: item.price * item.qty,
          };
        }),

        billingAddress: {
          ...address,
          line2: address.line2 || '',
          landmark: address.landmark || '',
        },

        shippingAddress: {
          ...address,
          line2: address.line2 || '',
          landmark: address.landmark || '',
        },

        pricing: {
          subtotal: cartMrpTotal,

          productDiscount:
            cartMrpTotal - cartSubtotal,

          couponDiscount: discountAmount,

          shippingCharge: shippingCost,

          tax: 0,

          grandTotal: total,
        },

        payment: {
          method: payMethod,
        },

        shipping: {
          method: shipMethod,
        },

        couponCode: appliedCoupon?.code,
      });

      const order = res.data;

      /*
       * COD
       *
       * No Razorpay payment required.
       */
      if (payMethod === 'cod') {
        clearCart();

        clearCoupon();

        navigate('/order-confirmation', {
          state: {
            orderNumber: order.orderNumber,
          },
        });

        return;
      }

      /*
       * ONLINE PAYMENT
       *
       * First check Razorpay configuration.
       */
      const { data: status } = await paymentsApi.status();

      if (!status.configured) {
        throw new Error(
          'Online payment is not configured yet. Please choose Cash on Delivery.'
        );
      }

      /*
       * Create Razorpay order from backend.
       */
      const { data: rp } =
        await paymentsApi.createOrder(order._id);

      /*
       * Open Razorpay Checkout.
       */
      const result = await openRazorpayCheckout({
        keyId: rp.keyId,

        amount: rp.amount,

        currency: rp.currency,

        razorpayOrderId: rp.razorpayOrderId,

        orderNumber: rp.orderNumber,

        name: address.fullName,

        email: address.email,

        contact: address.phone,

        /*
         * Selected payment category from our checkout.
         *
         * Example:
         * card
         * upi
         * netbanking
         * wallet
         */
        method: payMethod,
      });

      /*
       * Verify payment on backend.
       */
      await paymentsApi.verify({
        orderId: order._id,

        razorpayOrderId:
          result.razorpayOrderId,

        razorpayPaymentId:
          result.razorpayPaymentId,

        razorpaySignature:
          result.razorpaySignature,
      });

      /*
       * Payment successful.
       */
      clearCart();

      clearCoupon();

      navigate('/order-confirmation', {
        state: {
          orderNumber: order.orderNumber,
        },
      });
    } catch (err) {
      console.error(
        'Place order failed:',
        err
      );

      showError(
        err,
        'Could not place your order — please try again'
      );

      setFormError(
        err?.message ||
          'Could not place your order'
      );
    } finally {
      setPlacing(false);
    }
  }

  /*
   * Continue / Place Order button.
   */
  function next() {
    /*
     * Address validation.
     */
    if (step === 0 && !addressValid()) {
      setFormError(
        'Please fill in name, phone, address, city and pincode.'
      );

      return;
    }

    /*
     * Payment validation.
     */
    if (step === 2 && !payMethod) {
      setFormError(
        'Please select a payment method.'
      );

      return;
    }

    setFormError('');

    /*
     * Last step = place order.
     */
    if (step === STEPS.length - 1) {
      placeOrder();

      return;
    }

    setStep((current) => current + 1);
  }

  /*
   * Back button.
   */
  function previous() {
    if (placing) return;

    setFormError('');

    setStep((current) =>
      Math.max(0, current - 1)
    );
  }

  return (
    <>
      <PageHeader
        crumbs={[
          {
            label: 'Cart',
            to: '/cart',
          },
          {
            label: 'Checkout',
          },
        ]}
        title="Checkout"
      />

      <div
        className="section"
        style={{ paddingTop: 20 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">

            {/* =====================================================
                MAIN COLUMN
            ====================================================== */}

            <div>

              {/* =================================================
                  STEPS
              ================================================== */}

              <div className="mb-6 flex items-center justify-between">
                {STEPS.map((item, index) => {
                  const Icon = item.icon;

                  const active =
                    index === step;

                  const done =
                    index < step;

                  return (
                    <div
                      key={item.label}
                      className="flex flex-1 items-center"
                    >
                      <div className="flex flex-col items-center gap-1.5">

                        <span
                          className={`
                            flex h-9 w-9
                            items-center justify-center
                            rounded-full
                            text-sm font-semibold
                            transition-all duration-300
                            ${
                              done
                                ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white'
                                : active
                                ? 'bg-gradient-to-br from-[#f58bb1] to-[#e22467] text-white shadow-[0_6px_16px_rgba(226,36,103,0.35)]'
                                : 'bg-gray-100 text-gray-400'
                            }
                          `}
                        >
                          {done ? (
                            <FiCheck size={16} />
                          ) : (
                            <Icon size={15} />
                          )}
                        </span>

                        <span
                          className={`
                            text-[11px] font-medium
                            ${
                              active
                                ? 'text-[#ef6c9d]'
                                : done
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                      </div>

                      {index <
                        STEPS.length - 1 && (
                        <div
                          className={`
                            mx-2 h-[2px]
                            flex-1 rounded
                            transition-colors duration-300
                            ${
                              done
                                ? 'bg-[#ef6c9d]'
                                : 'bg-gray-200'
                            }
                          `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* =================================================
                  PANEL
              ================================================== */}

              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(226,36,103,0.25)]">

                <AnimatePresence mode="wait">

                  <motion.div
                    key={step}
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >

                    {/* =================================================
                        STEP 0 — ADDRESS
                    ================================================== */}

                    {step === 0 && (
                      <div>

                        {!user && (
                          <div className="mb-5 flex gap-2 rounded-full bg-[#fff5f8] p-1">

                            <button
                              type="button"
                              className="flex-1 rounded-full bg-white py-2 text-sm font-semibold text-gray-900 shadow-sm"
                            >
                              Guest Checkout
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate('/login', {
                                  state: {
                                    from: '/checkout',
                                  },
                                })
                              }
                              className="flex-1 rounded-full py-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#ef6c9d]"
                            >
                              Sign In Instead
                            </button>

                          </div>
                        )}

                        {/* =================================================
                            SAVED ADDRESSES
                        ================================================== */}

                        {savedAddresses.length > 0 && (
                          <div className="mb-5">

                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Saved Address
                              {savedAddresses.length > 1
                                ? 'es'
                                : ''}
                            </h4>

                            <div className="flex flex-col gap-2">

                              {savedAddresses.map(
                                (saved) => {
                                  const id =
                                    saved.id ||
                                    saved._id ||
                                    'default';

                                  const isSelected =
                                    selectedSavedId ===
                                      id &&
                                    !showNewForm;

                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() =>
                                        applySavedAddress(
                                          saved
                                        )
                                      }
                                      className={`
                                        flex items-start gap-3
                                        rounded-xl border p-3
                                        text-left
                                        transition-all
                                        ${
                                          isSelected
                                            ? 'border-[#ef6c9d] bg-[#fff5f8] shadow-[0_4px_14px_rgba(226,36,103,0.15)]'
                                            : 'border-gray-200 hover:border-[#f8b4ca]'
                                        }
                                      `}
                                    >

                                      <span
                                        className={`
                                          mt-0.5 flex h-8 w-8
                                          shrink-0 items-center
                                          justify-center rounded-full
                                          ${
                                            isSelected
                                              ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white'
                                              : 'bg-gray-100 text-gray-400'
                                          }
                                        `}
                                      >
                                        <FiMapPin
                                          size={14}
                                        />
                                      </span>

                                      <span className="flex-1">

                                        <span className="block text-sm font-semibold text-gray-900">
                                          {saved.fullName ||
                                            user?.name ||
                                            'Saved address'}
                                        </span>

                                        <span className="block text-xs text-gray-500">
                                          {saved.line1 ||
                                            saved.address1}
                                          , {saved.city}{' '}
                                          {saved.pincode ||
                                            saved.zip}
                                        </span>

                                      </span>

                                      {isSelected && (
                                        <FiCheck className="mt-1 shrink-0 text-[#ef6c9d]" />
                                      )}

                                    </button>
                                  );
                                }
                              )}

                              {/* NEW ADDRESS */}

                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewForm(
                                    true
                                  );

                                  setSelectedSavedId(
                                    null
                                  );

                                  setAddress(
                                    emptyAddress
                                  );

                                  setFormError('');
                                }}
                                className={`
                                  flex items-center
                                  justify-between
                                  rounded-xl
                                  border border-dashed
                                  p-3 text-left text-sm
                                  font-medium
                                  transition-colors
                                  ${
                                    showNewForm
                                      ? 'border-[#ef6c9d] bg-[#fff5f8] text-[#ef6c9d]'
                                      : 'border-gray-200 text-gray-500 hover:border-[#f8b4ca] hover:text-[#ef6c9d]'
                                  }
                                `}
                              >
                                Use a new address

                                <FiChevronRight
                                  size={14}
                                />
                              </button>

                            </div>
                          </div>
                        )}

                        {/* =================================================
                            ADDRESS FORM
                        ================================================== */}

                        {showNewForm && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            <Field
                              placeholder="Full Name"
                              value={
                                address.fullName
                              }
                              onChange={(value) =>
                                updateField(
                                  'fullName',
                                  value
                                )
                              }
                            />

                            <Field
                              placeholder="Phone Number"
                              value={
                                address.phone
                              }
                              onChange={(value) =>
                                updateField(
                                  'phone',
                                  value
                                )
                              }
                            />

                            <Field
                              className="sm:col-span-2"
                              placeholder="Email Address"
                              value={
                                address.email
                              }
                              onChange={(value) =>
                                updateField(
                                  'email',
                                  value
                                )
                              }
                            />

                            <Field
                              className="sm:col-span-2"
                              placeholder="Address Line 1"
                              value={
                                address.line1
                              }
                              onChange={(value) =>
                                updateField(
                                  'line1',
                                  value
                                )
                              }
                            />

                            <Field
                              placeholder="City"
                              value={
                                address.city
                              }
                              onChange={(value) =>
                                updateField(
                                  'city',
                                  value
                                )
                              }
                            />

                            <Field
                              placeholder="State"
                              value={
                                address.state
                              }
                              onChange={(value) =>
                                updateField(
                                  'state',
                                  value
                                )
                              }
                            />

                            <Field
                              placeholder="PIN Code"
                              value={
                                address.pincode
                              }
                              onChange={(value) =>
                                updateField(
                                  'pincode',
                                  value
                                )
                              }
                            />

                            <Field
                              placeholder="Country"
                              value={
                                address.country
                              }
                              onChange={(value) =>
                                updateField(
                                  'country',
                                  value
                                )
                              }
                            />

                          </div>
                        )}

                      </div>
                    )}

                    {/* =================================================
                        STEP 1 — SHIPPING
                    ================================================== */}

                    {step === 1 && (
                      <div className="flex flex-col gap-3">

                        <RadioCard
                          active={
                            shipMethod ===
                            'standard'
                          }
                          onClick={() =>
                            setShipMethod(
                              'standard'
                            )
                          }
                          title="Standard Shipping"
                          sub={`3–6 business days · ${
                            cartSubtotal > 15000
                              ? 'Free'
                              : rupee(499)
                          }`}
                          icon={FiTruck}
                        />

                        <RadioCard
                          active={
                            shipMethod ===
                            'express'
                          }
                          onClick={() =>
                            setShipMethod(
                              'express'
                            )
                          }
                          title="Express Shipping"
                          sub={`1–2 business days · ${rupee(
                            999
                          )}`}
                          icon={FiPackage}
                        />

                      </div>
                    )}

                    {/* =================================================
                        STEP 2 — PAYMENT
                    ================================================== */}

                    {step === 2 && (
                      <div>

                        <div className="mb-4">
                          <h3 className="text-base font-bold text-gray-900">
                            Select Payment Method
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            Choose how you want to
                            pay for your order.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">

                          {PAYMENT_OPTIONS.map(
                            (option) => (
                              <RadioCard
                                key={option.id}
                                active={
                                  payMethod ===
                                  option.id
                                }
                                onClick={() =>
                                  setPayMethod(
                                    option.id
                                  )
                                }
                                title={
                                  option.title
                                }
                                sub={
                                  option.sub
                                }
                                icon={
                                  option.icon
                                }
                              />
                            )
                          )}

                        </div>

                        {payMethod !== 'cod' && (
                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff5f8] px-3 py-3 text-xs text-gray-500">

                            <FiLock
                              className="mt-0.5 shrink-0 text-[#ef6c9d]"
                              size={14}
                            />

                            <span>
                              You will be securely
                              redirected to Razorpay
                              Checkout to complete
                              your payment.
                              <br />
                              Card, UPI, Netbanking
                              and other methods shown
                              there depend on your
                              Razorpay account and
                              customer's availability.
                            </span>

                          </div>
                        )}

                        {payMethod === 'cod' && (
                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff5f8] px-3 py-3 text-xs text-gray-500">

                            <FiPackage
                              className="mt-0.5 shrink-0 text-[#ef6c9d]"
                              size={14}
                            />

                            <span>
                              Pay in cash when your
                              order is delivered.
                            </span>

                          </div>
                        )}

                      </div>
                    )}

                    {/* =================================================
                        STEP 3 — REVIEW
                    ================================================== */}

                    {step === 3 && (
                      <div className="divide-y divide-gray-100 text-sm">

                        {cart.map((item) => (
                          <div
                            className="flex justify-between gap-4 py-2.5 text-gray-600"
                            key={item.id}
                          >
                            <span>
                              {item.name} ×{' '}
                              {item.qty}
                            </span>

                            <span className="shrink-0 font-medium text-gray-900">
                              {rupee(
                                item.price *
                                  item.qty
                              )}
                            </span>
                          </div>
                        ))}

                        {appliedCoupon && (
                          <div className="flex justify-between py-2.5 text-[#ef6c9d]">

                            <span>
                              Coupon (
                              {
                                appliedCoupon.code
                              }
                              )
                            </span>

                            <span>
                              −
                              {rupee(
                                discountAmount
                              )}
                            </span>

                          </div>
                        )}

                        <div className="flex justify-between py-2.5 text-gray-600">

                          <span>
                            Shipping (
                            {shipMethod}
                            )
                          </span>

                          <span className="font-medium text-gray-900">
                            {shippingCost ===
                            0
                              ? 'Free'
                              : rupee(
                                  shippingCost
                                )}
                          </span>

                        </div>

                        <div className="flex justify-between py-2.5 text-gray-600">

                          <span>
                            Payment Method
                          </span>

                          <span className="font-medium text-gray-900">
                            {
                              PAYMENT_OPTIONS.find(
                                (option) =>
                                  option.id ===
                                  payMethod
                              )?.title ||
                                payMethod
                            }
                          </span>

                        </div>

                        <div className="flex justify-between gap-4 py-2.5 text-gray-600">

                          <span>
                            Deliver To
                          </span>

                          <span className="text-right font-medium text-gray-900">
                            {address.fullName},{' '}
                            {address.city}{' '}
                            {address.pincode}
                          </span>

                        </div>

                        {/* FINAL TOTAL */}

                        <div className="flex justify-between pt-4 text-base">

                          <span className="font-bold text-gray-900">
                            Total
                          </span>

                          <span className="font-bold text-[#e22467]">
                            {rupee(total)}
                          </span>

                        </div>

                      </div>
                    )}

                  </motion.div>

                </AnimatePresence>

                {/* =================================================
                    ERROR
                ================================================== */}

                {formError && (
                  <p className="mt-4 rounded-lg bg-[#fff0f4] px-3 py-2 text-xs font-medium text-[#c81e5c]">
                    {formError}
                  </p>
                )}

                {/* =================================================
                    NAVIGATION BUTTONS
                ================================================== */}

                <div className="mt-6 flex justify-end gap-3">

                  {step > 0 && (
                    <button
                      type="button"
                      onClick={previous}
                      disabled={placing}
                      className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#ef6c9d] hover:text-[#ef6c9d] disabled:opacity-50"
                    >
                      Back
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={next}
                    disabled={
                      placing ||
                      cart.length === 0
                    }
                    className="rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.3)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {placing
                      ? 'Processing…'
                      : step ===
                        STEPS.length - 1
                      ? payMethod === 'cod'
                        ? 'Place Order'
                        : 'Proceed to Payment'
                      : 'Continue'}
                  </button>

                </div>

              </div>
            </div>

            {/* =====================================================
                ORDER SUMMARY
            ====================================================== */}

            <aside className="h-fit rounded-2xl border border-black/5 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">

              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Order Summary
              </h3>

              <div className="max-h-48 space-y-2 overflow-y-auto pr-1 text-xs">

                {cart.map((item) => (
                  <div
                    className="flex items-center gap-2.5"
                    key={item.id}
                  >

                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#fff5f8]">

                      {item.image ? (
                        <img
                          src={resolveImageUrl(
                            item.image
                          )}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              'none';
                          }}
                        />
                      ) : null}

                    </div>

                    <span className="flex-1 truncate text-gray-500">
                      {item.name} × {item.qty}
                    </span>

                    <span className="shrink-0 font-medium text-gray-800">
                      {rupee(
                        item.price *
                          item.qty
                      )}
                    </span>

                  </div>
                ))}

              </div>

              <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 text-xs">

                <div className="flex justify-between text-gray-500">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    {rupee(cartSubtotal)}
                  </span>

                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#ef6c9d]">

                    <span>
                      Coupon (
                      {appliedCoupon.code}
                      )
                    </span>

                    <span>
                      −
                      {rupee(
                        discountAmount
                      )}
                    </span>

                  </div>
                )}

                <div className="flex justify-between text-gray-500">

                  <span>
                    Shipping
                  </span>

                  <span>
                    {shippingCost === 0
                      ? 'Free'
                      : rupee(
                          shippingCost
                        )}
                  </span>

                </div>

              </div>

              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">

                <span className="text-sm font-bold text-gray-900">
                  Total
                </span>

                <span className="text-base font-bold text-gray-900">
                  {rupee(total)}
                </span>

              </div>

            </aside>

          </div>
        </div>
      </div>
    </>
  );
}

/*
 * ============================================================
 * FIELD COMPONENT
 * ============================================================
 */

function Field({
  placeholder,
  value,
  onChange,
  className = '',
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={`
        rounded-xl
        border border-gray-200
        bg-[#fff8fa]
        px-4 py-2.5
        text-sm text-gray-800
        placeholder:text-gray-400
        transition-colors
        focus:border-[#ef6c9d]
        focus:bg-white
        focus:outline-none
        ${className}
      `}
    />
  );
}

/*
 * ============================================================
 * RADIO CARD COMPONENT
 * ============================================================
 */

function RadioCard({
  active,
  onClick,
  title,
  sub,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full
        items-center gap-3
        rounded-xl
        border p-3.5
        text-left
        transition-all
        ${
          active
            ? 'border-[#ef6c9d] bg-[#fff5f8] shadow-[0_4px_14px_rgba(226,36,103,0.15)]'
            : 'border-gray-200 hover:border-[#f8b4ca]'
        }
      `}
    >

      {/* ICON */}

      <span
        className={`
          flex h-9 w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            active
              ? 'bg-gradient-to-br from-[#f8b4ca] to-[#ef6c9d] text-white'
              : 'bg-gray-100 text-gray-400'
          }
        `}
      >
        <Icon size={15} />
      </span>

      {/* CONTENT */}

      <span className="flex-1">

        <span className="block text-sm font-semibold text-gray-900">
          {title}
        </span>

        <span className="block text-xs text-gray-500">
          {sub}
        </span>

      </span>

      {/* CHECK */}

      {active && (
        <FiCheck
          className="shrink-0 text-[#ef6c9d]"
          size={18}
        />
      )}

    </button>
  );
}