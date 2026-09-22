import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiPackage,
  FiLock,
  FiMapPin,
  FiChevronRight,
} from 'react-icons/fi';

import PageHeader from '../components/PageHeader';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { ordersApi, paymentsApi } from '../lib/resources';

const STEPS = [
  {
    id: 'address',
    label: 'Address',
    icon: FiMapPin,
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: FiTruck,
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: FiCreditCard,
  },
  {
    id: 'review',
    label: 'Review',
    icon: FiCheck,
  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'online',
    title: 'Pay Online',
    subtitle: 'Pay securely via Bluevine Payment Link',
    icon: FiCreditCard,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order is delivered',
    icon: FiPackage,
  },
];

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function Checkout() {
  const navigate = useNavigate();

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

  const [step, setStep] = useState(0);

  const [address, setAddress] = useState(emptyAddress);

  const [shipMethod, setShipMethod] = useState('standard');

  const [payMethod, setPayMethod] = useState('online');

  const [placing, setPlacing] = useState(false);

  const [formError, setFormError] = useState('');

  const [selectedSavedId, setSelectedSavedId] = useState(null);

  const [showNewForm, setShowNewForm] = useState(false);

  const savedAddresses = user?.addresses?.length
    ? user.addresses
    : user?.address
      ? [user.address]
      : [];

  useEffect(() => {
    if (savedAddresses.length === 1) {
      applySavedAddress(savedAddresses[0]);
    } else if (savedAddresses.length === 0) {
      setShowNewForm(true);
    }
  }, [user]);

  const applySavedAddress = (saved) => {
    if (!saved) return;

    setAddress({
      ...emptyAddress,
      ...saved,
      fullName: saved.fullName || saved.name || '',
      phone: saved.phone || '',
      email: saved.email || user?.email || '',
      line1: saved.line1 || saved.address || '',
      line2: saved.line2 || '',
      landmark: saved.landmark || '',
      city: saved.city || '',
      state: saved.state || '',
      pincode: saved.pincode || saved.zip || '',
      country: saved.country || 'India',
    });

    setSelectedSavedId(saved._id || saved.id || null);
    setShowNewForm(false);
    setFormError('');
  };

  const shippingCost =
    shipMethod === 'express'
      ? 999
      : cartSubtotal > 15000
        ? 0
        : 499;

  const discountAmount = Number(appliedCoupon?.discount || 0);

  const total = Math.max(
    0,
    Number(cartSubtotal || 0) - discountAmount
  ) + shippingCost;

  const addressValid =
    String(address.fullName || '').trim() &&
    String(address.phone || '').trim() &&
    String(address.line1 || '').trim() &&
    String(address.city || '').trim() &&
    String(address.pincode || '').trim();

  const updateAddress = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormError('');
  };

  const placeOrder = async () => {
    if (!cart?.length) {
      setFormError('Your cart is empty.');
      return;
    }

    if (!addressValid) {
      setFormError(
        'Please fill in all required delivery address fields.'
      );
      setStep(0);
      return;
    }

    setPlacing(true);
    setFormError('');

    try {
      const orderItems = cart.map((item) => {
        const product = item.product || item;

        const quantity = Number(item.quantity || 1);

        const price = Number(
          item.price ??
            product.price ??
            item.finalPrice ??
            0
        );

        const mrp = Number(
          item.mrp ??
            product.mrp ??
            price
        );

        const finalPrice = price;

        const itemDiscount = Math.max(
          0,
          (mrp - finalPrice) * quantity
        );

        return {
          productId:
            item.productId ||
            product._id ||
            product.id,

          productName:
            item.productName ||
            product.name ||
            'Product',

          sku:
            item.sku ||
            product.sku ||
            '',

          image:
            item.image ||
            product.image ||
            product.images?.[0] ||
            '',

          variant: {
            length:
              item.variant?.length ||
              item.length ||
              '',

            color:
              item.variant?.color ||
              item.color ||
              '',

            texture:
              item.variant?.texture ||
              item.texture ||
              '',
          },

          quantity,

          unitPrice: mrp,

          discount: itemDiscount,

          finalPrice,

          total: finalPrice * quantity,
        };
      });

      const orderPayload = {
        customerName: address.fullName,
        email: address.email || user?.email || '',
        phone: address.phone,

        items: orderItems,

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
          subtotal: Number(cartMrpTotal || 0),

          productDiscount: Math.max(
            0,
            Number(cartMrpTotal || 0) -
              Number(cartSubtotal || 0)
          ),

          couponDiscount: discountAmount,

          shippingCharge: shippingCost,

          tax: 0,

          grandTotal: total,
        },

        paymentMethod: payMethod,

        shippingMethod: shipMethod,

        couponCode:
          appliedCoupon?.code ||
          appliedCoupon?.couponCode ||
          '',
      };

      const response = await ordersApi.create(orderPayload);

      const createdOrder = response?.data || response;

      const orderNumber =
        createdOrder?.orderNumber ||
        createdOrder?.order?.orderNumber ||
        createdOrder?.data?.orderNumber ||
        createdOrder?._id ||
        createdOrder?.id;

      if (!orderNumber) {
        throw new Error(
          'Order was created but order number was not returned.'
        );
      }

      if (payMethod === 'cod') {
        clearCart();
        clearCoupon();

        navigate('/order-confirmation', {
          state: {
            orderNumber,
            paymentMethod: 'cod',
          },
        });

        return;
      }

      const statusResponse = await paymentsApi.status();

      const status = statusResponse?.data || statusResponse;

      if (!status?.configured) {
        throw new Error(
          'Online payment is currently not configured. Please try Cash on Delivery or contact support.'
        );
      }

      const paymentLink =
        status?.paymentLink ||
        status?.payment_link ||
        status?.url ||
        '';

      if (!paymentLink) {
        throw new Error(
          'Payment link is not available right now. Please try again later.'
        );
      }

      clearCart();
      clearCoupon();

      navigate('/order-confirmation', {
        state: {
          orderNumber,
          paymentMethod: 'online',
          paymentLink,
          amount: total,
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong while placing your order.';

      setFormError(message);

      if (typeof showError === 'function') {
        showError(message);
      }
    } finally {
      setPlacing(false);
    }
  };

  const next = async () => {
    setFormError('');

    if (step === 0) {
      if (!addressValid) {
        setFormError(
          'Please complete your delivery address before continuing.'
        );
        return;
      }
    }

    if (step === 2) {
      if (!payMethod) {
        setFormError('Please select a payment method.');
        return;
      }
    }

    if (step === STEPS.length - 1) {
      await placeOrder();
      return;
    }

    setStep((current) => current + 1);
  };

  const previous = () => {
    setFormError('');

    setStep((current) => Math.max(0, current - 1));
  };

  if (!cart?.length) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader
          title="Checkout"
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Cart', path: '/cart' },
            { label: 'Checkout' },
          ]}
        />

        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FiPackage className="h-7 w-7 text-gray-500" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-gray-500">
              Add some products to your cart before checking out.
            </p>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Browse Shop
              <FiChevronRight />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Checkout"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* STEPS */}
        <div className="mb-8 overflow-x-auto">
          <div className="mx-auto flex min-w-[650px] max-w-4xl items-center justify-center">
            {STEPS.map((item, index) => {
              const Icon = item.icon;

              const completed = index < step;

              const active = index === step;

              return (
                <div
                  key={item.id}
                  className="flex flex-1 items-center"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (index <= step) {
                          setFormError('');
                          setStep(index);
                        }
                      }}
                      disabled={index > step}
                      className="group flex flex-col items-center"
                    >
                      <div
                        className={[
                          'flex h-11 w-11 items-center justify-center rounded-full border-2 transition',
                          completed || active
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-400',
                        ].join(' ')}
                      >
                        {completed ? (
                          <FiCheck className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <span
                        className={[
                          'mt-2 text-xs font-semibold sm:text-sm',
                          active || completed
                            ? 'text-gray-900'
                            : 'text-gray-400',
                        ].join(' ')}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={[
                        'mx-2 h-0.5 flex-1',
                        index < step
                          ? 'bg-black'
                          : 'bg-gray-200',
                      ].join(' ')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -15,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="p-5 sm:p-7"
                >
                  {/* STEP 1 - ADDRESS */}
                  {step === 0 && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Delivery Address
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Where should we deliver your order?
                        </p>
                      </div>

                      {!user && (
                        <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm text-gray-700">
                            Already have an account?
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              navigate('/login', {
                                state: {
                                  from: '/checkout',
                                },
                              })
                            }
                            className="mt-2 text-sm font-semibold text-black underline underline-offset-4"
                          >
                            Sign in to continue
                          </button>
                        </div>
                      )}

                      {savedAddresses.length > 0 && (
                        <div className="mb-7">
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                              Saved Addresses
                            </h3>

                            <button
                              type="button"
                              onClick={() => {
                                setShowNewForm(true);
                                setSelectedSavedId(null);
                                setAddress(emptyAddress);
                                setFormError('');
                              }}
                              className="text-sm font-semibold text-black underline underline-offset-4"
                            >
                              Use new address
                            </button>
                          </div>

                          <div className="grid gap-3">
                            {savedAddresses.map((saved, index) => {
                              const id =
                                saved._id ||
                                saved.id ||
                                `saved-${index}`;

                              const selected =
                                selectedSavedId === id;

                              return (
                                <button
                                  type="button"
                                  key={id}
                                  onClick={() =>
                                    applySavedAddress(saved)
                                  }
                                  className={[
                                    'w-full rounded-2xl border p-4 text-left transition',
                                    selected
                                      ? 'border-black bg-gray-50 ring-1 ring-black'
                                      : 'border-gray-200 hover:border-gray-400',
                                  ].join(' ')}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={[
                                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                        selected
                                          ? 'border-black bg-black text-white'
                                          : 'border-gray-300',
                                      ].join(' ')}
                                    >
                                      {selected && (
                                        <FiCheck className="h-3 w-3" />
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900">
                                        {saved.fullName ||
                                          saved.name ||
                                          'Address'}
                                      </p>

                                      <p className="mt-1 text-sm leading-6 text-gray-500">
                                        {saved.line1 ||
                                          saved.address ||
                                          ''}
                                        {saved.line2
                                          ? `, ${saved.line2}`
                                          : ''}
                                        {saved.city
                                          ? `, ${saved.city}`
                                          : ''}
                                        {saved.state
                                          ? `, ${saved.state}`
                                          : ''}
                                        {saved.pincode
                                          ? ` - ${saved.pincode}`
                                          : ''}
                                      </p>

                                      {saved.phone && (
                                        <p className="mt-1 text-sm text-gray-500">
                                          {saved.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(showNewForm || savedAddresses.length === 0) && (
                        <div>
                          <div className="mb-4 flex items-center gap-2">
                            <FiMapPin className="h-5 w-5 text-gray-700" />

                            <h3 className="font-semibold text-gray-900">
                              {savedAddresses.length > 0
                                ? 'New Address'
                                : 'Enter Address'}
                            </h3>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                              label="Full Name"
                              required
                              value={address.fullName}
                              onChange={(value) =>
                                updateAddress(
                                  'fullName',
                                  value
                                )
                              }
                              placeholder="Your full name"
                            />

                            <Field
                              label="Phone"
                              required
                              value={address.phone}
                              onChange={(value) =>
                                updateAddress(
                                  'phone',
                                  value
                                )
                              }
                              placeholder="10-digit mobile number"
                              type="tel"
                            />

                            <Field
                              label="Email"
                              value={address.email}
                              onChange={(value) =>
                                updateAddress(
                                  'email',
                                  value
                                )
                              }
                              placeholder="you@example.com"
                              type="email"
                            />

                            <div />

                            <div className="sm:col-span-2">
                              <Field
                                label="Address"
                                required
                                value={address.line1}
                                onChange={(value) =>
                                  updateAddress(
                                    'line1',
                                    value
                                  )
                                }
                                placeholder="House / Flat / Street"
                              />
                            </div>

                            <Field
                              label="Address Line 2"
                              value={address.line2}
                              onChange={(value) =>
                                updateAddress(
                                  'line2',
                                  value
                                )
                              }
                              placeholder="Apartment, area, etc."
                            />

                            <Field
                              label="Landmark"
                              value={address.landmark}
                              onChange={(value) =>
                                updateAddress(
                                  'landmark',
                                  value
                                )
                              }
                              placeholder="Nearby landmark"
                            />

                            <Field
                              label="City"
                              required
                              value={address.city}
                              onChange={(value) =>
                                updateAddress(
                                  'city',
                                  value
                                )
                              }
                              placeholder="City"
                            />

                            <Field
                              label="State"
                              value={address.state}
                              onChange={(value) =>
                                updateAddress(
                                  'state',
                                  value
                                )
                              }
                              placeholder="State"
                            />

                            <Field
                              label="Pincode"
                              required
                              value={address.pincode}
                              onChange={(value) =>
                                updateAddress(
                                  'pincode',
                                  value
                                )
                              }
                              placeholder="6-digit pincode"
                              type="text"
                            />

                            <Field
                              label="Country"
                              value={address.country}
                              onChange={(value) =>
                                updateAddress(
                                  'country',
                                  value
                                )
                              }
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 - SHIPPING */}
                  {step === 1 && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Shipping Method
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Choose how quickly you want your order.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <RadioCard
                          selected={shipMethod === 'standard'}
                          onClick={() =>
                            setShipMethod('standard')
                          }
                          icon={FiTruck}
                          title="Standard Shipping"
                          description="3–6 business days"
                          price={
                            cartSubtotal > 15000
                              ? 'Free'
                              : rupee(499)
                          }
                        />

                        <RadioCard
                          selected={shipMethod === 'express'}
                          onClick={() =>
                            setShipMethod('express')
                          }
                          icon={FiTruck}
                          title="Express Shipping"
                          description="1–3 business days"
                          price={rupee(999)}
                        />
                      </div>

                      <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                        <div className="flex gap-3">
                          <FiTruck className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" />

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Free standard shipping
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Orders above ₹15,000 qualify for free standard delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 - PAYMENT */}
                  {step === 2 && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Payment Method
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Select your preferred payment option.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {PAYMENT_OPTIONS.map((option) => (
                          <RadioCard
                            key={option.id}
                            selected={
                              payMethod === option.id
                            }
                            onClick={() =>
                              setPayMethod(option.id)
                            }
                            icon={option.icon}
                            title={option.title}
                            description={option.subtitle}
                          />
                        ))}
                      </div>

                      {payMethod === 'online' && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                              <FiLock className="h-5 w-5 text-gray-700" />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                Secure Online Payment
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-500">
                                After placing your order, you will be redirected to the Bluevine payment link to complete your payment securely.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {payMethod === 'cod' && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                          <div className="flex gap-3">
                            <FiPackage className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" />

                            <div>
                              <p className="font-semibold text-gray-900">
                                Cash on Delivery
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-500">
                                Pay in cash when your order is delivered to your address.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4 - REVIEW */}
                  {step === 3 && (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Review Your Order
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Please check your details before placing the order.
                        </p>
                      </div>

                      {/* ITEMS */}
                      <div className="rounded-2xl border border-gray-200">
                        <div className="border-b border-gray-200 px-4 py-4">
                          <h3 className="font-semibold text-gray-900">
                            Order Items
                          </h3>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {cart.map((item, index) => {
                            const product =
                              item.product || item;

                            const image =
                              item.image ||
                              product.image ||
                              product.images?.[0] ||
                              '';

                            const name =
                              item.productName ||
                              product.name ||
                              'Product';

                            const price = Number(
                              item.price ??
                                product.price ??
                                0
                            );

                            const quantity = Number(
                              item.quantity || 1
                            );

                            return (
                              <div
                                key={
                                  item.cartId ||
                                  item._id ||
                                  item.productId ||
                                  index
                                }
                                className="flex gap-4 p-4"
                              >
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <FiPackage className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {name}
                                  </h4>

                                  <p className="mt-1 text-sm text-gray-500">
                                    Qty: {quantity}
                                  </p>

                                  <p className="mt-2 font-semibold text-gray-900">
                                    {rupee(
                                      price * quantity
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ADDRESS */}
                      <div className="mt-5 rounded-2xl border border-gray-200 p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <FiMapPin className="h-5 w-5 text-gray-700" />

                          <h3 className="font-semibold text-gray-900">
                            Deliver To
                          </h3>
                        </div>

                        <p className="font-medium text-gray-900">
                          {address.fullName}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {address.line1}
                          {address.line2
                            ? `, ${address.line2}`
                            : ''}
                          {address.landmark
                            ? `, ${address.landmark}`
                            : ''}
                          {address.city
                            ? `, ${address.city}`
                            : ''}
                          {address.state
                            ? `, ${address.state}`
                            : ''}
                          {address.pincode
                            ? ` - ${address.pincode}`
                            : ''}
                          {address.country
                            ? `, ${address.country}`
                            : ''}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {address.phone}
                        </p>

                        {address.email && (
                          <p className="text-sm text-gray-500">
                            {address.email}
                          </p>
                        )}
                      </div>

                      {/* SHIPPING + PAYMENT */}
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 p-5">
                          <div className="flex items-center gap-2">
                            <FiTruck className="h-5 w-5 text-gray-700" />

                            <h3 className="font-semibold text-gray-900">
                              Shipping
                            </h3>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            {shipMethod === 'express'
                              ? 'Express Shipping'
                              : 'Standard Shipping'}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {shippingCost === 0
                              ? 'Free'
                              : rupee(shippingCost)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-5">
                          <div className="flex items-center gap-2">
                            <FiCreditCard className="h-5 w-5 text-gray-700" />

                            <h3 className="font-semibold text-gray-900">
                              Payment
                            </h3>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            {payMethod === 'online'
                              ? 'Pay Online via Bluevine'
                              : 'Cash on Delivery'}
                          </p>
                        </div>
                      </div>

                      {/* SUMMARY */}
                      <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">
                              Subtotal
                            </span>

                            <span className="font-medium text-gray-900">
                              {rupee(
                                Number(cartSubtotal || 0)
                              )}
                            </span>
                          </div>

                          {discountAmount > 0 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">
                                Coupon Discount
                              </span>

                              <span className="font-medium text-green-600">
                                -{rupee(discountAmount)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">
                              Shipping
                            </span>

                            <span className="font-medium text-gray-900">
                              {shippingCost === 0
                                ? 'Free'
                                : rupee(shippingCost)}
                            </span>
                          </div>

                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-base font-semibold text-gray-900">
                                Total
                              </span>

                              <span className="text-xl font-bold text-gray-900">
                                {rupee(total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ERROR */}
                  {formError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-medium text-red-700">
                        {formError}
                      </p>
                    </div>
                  )}

                  {/* NAVIGATION */}
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
                    <button
                      type="button"
                      onClick={previous}
                      disabled={step === 0 || placing}
                      className={[
                        'rounded-xl px-5 py-3 text-sm font-semibold transition',
                        step === 0 || placing
                          ? 'cursor-not-allowed text-gray-300'
                          : 'text-gray-700 hover:bg-gray-100',
                      ].join(' ')}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={next}
                      disabled={placing || !cart.length}
                      className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {placing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                          Processing...
                        </>
                      ) : step === STEPS.length - 1 ? (
                        <>
                          Place Order
                          <FiCheck className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Continue
                          <FiChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {cart.length}{' '}
                  {cart.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="max-h-[360px] divide-y divide-gray-100 overflow-y-auto">
                {cart.map((item, index) => {
                  const product = item.product || item;

                  const image =
                    item.image ||
                    product.image ||
                    product.images?.[0] ||
                    '';

                  const name =
                    item.productName ||
                    product.name ||
                    'Product';

                  const price = Number(
                    item.price ??
                      product.price ??
                      0
                  );

                  const quantity = Number(
                    item.quantity || 1
                  );

                  return (
                    <div
                      key={
                        item.cartId ||
                        item._id ||
                        item.productId ||
                        index
                      }
                      className="flex gap-3 p-4"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FiPackage className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                          {name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {quantity}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {rupee(price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-gray-200 p-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {rupee(Number(cartSubtotal || 0))}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Coupon
                    </span>

                    <span className="font-medium text-green-600">
                      -{rupee(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium text-gray-900">
                    {shippingCost === 0
                      ? 'Free'
                      : rupee(shippingCost)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      {rupee(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FiLock className="h-4 w-4 text-gray-700" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Secure Checkout
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your checkout information is handled securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = 'text',
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-800">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5"
      />
    </label>
  );
}

function RadioCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  price,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl border p-4 text-left transition',
        selected
          ? 'border-black bg-gray-50 ring-1 ring-black'
          : 'border-gray-200 bg-white hover:border-gray-400',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            selected
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-gray-900">
              {title}
            </p>

            {price && (
              <p className="font-semibold text-gray-900">
                {price}
              </p>
            )}
          </div>

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white',
          ].join(' ')}
        >
          {selected && (
            <FiCheck className="h-3 w-3" />
          )}
        </div>
      </div>
    </button>
  );
}