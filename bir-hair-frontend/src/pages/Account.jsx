import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiPackage,
  FiTruck,
  FiMapPin,
  FiHeart,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiChevronRight,
  FiCheck,
  FiPhone,
  FiMail,
  FiEdit2,
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import { LineSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { authApi, ordersApi, usersApi } from '../lib/resources';

const TABS = [
  { key: 'Orders', label: 'Orders', icon: FiPackage },
  { key: 'Tracking', label: 'Tracking', icon: FiTruck },
  { key: 'Addresses', label: 'Addresses', icon: FiMapPin },
  { key: 'Wishlist', label: 'Wishlist', icon: FiHeart },
  { key: 'Profile', label: 'Profile', icon: FiUser },
];

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-blue-50 text-blue-600',
  packed: 'bg-violet-50 text-violet-600',
  shipped: 'bg-indigo-50 text-indigo-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-500',
  returned: 'bg-gray-100 text-gray-500',
};

function StatusPill({ status }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'
      }`}
    >
      {status || 'pending'}
    </span>
  );
}

export default function Account() {
  const [tab, setTab] = useState('Orders');
  const { user, authChecked, logout, wishlist, showToast, showError } = useStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [addressForm, setAddressForm] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (authChecked && !user) navigate('/login', { state: { from: '/account' } });
  }, [authChecked, user, navigate]);

  useEffect(() => {
    if (!user) return;
    authApi.me().then((res) => {
      setProfile(res.user);
      setProfileForm({ name: res.user.name || '', phone: res.user.phone || '' });
    });
    ordersApi.mine().then((res) => setOrders(res.data)).catch((err) => setOrdersError(err));
  }, [user]);

  if (!user) return null;

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await usersApi.updateProfile(profileForm);
      setProfile((p) => ({ ...p, ...res.data }));
      showToast('Profile updated');
    } catch (err) {
      showError(err, 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function addAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await usersApi.addAddress(addressForm);
      setProfile((p) => ({ ...p, addresses: res.data }));
      setAddressForm(null);
      showToast('Address added');
    } catch (err) {
      showError(err, 'Could not save address');
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteAddress(id) {
    try {
      const res = await usersApi.deleteAddress(id);
      setProfile((p) => ({ ...p, addresses: res.data }));
    } catch (err) {
      showError(err, 'Could not remove address');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  // Backend order documents use `orderStatus`, not `status`.
  const trackingOrder =
    orders?.find((o) => !['delivered', 'cancelled', 'returned'].includes(o.orderStatus)) || orders?.[0];

  return (
    <>
      <PageHeader crumbs={[{ label: 'My Account' }]} title="My Account" lede="Manage your orders, addresses and saved pieces." />

      <div className="bg-[#fffafb]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            {/* ===================== SIDEBAR ===================== */}
            <aside className="h-fit lg:sticky lg:top-6">
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
                <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f8b4ca] to-[#e22467] text-lg font-bold text-white">
                    {(user.name || user.email || '?').trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <nav className="mt-3 flex flex-col gap-1">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'bg-gradient-to-r from-[#fff0f5] to-[#fff5f8] text-[#e22467]'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} className={active ? 'text-[#e22467]' : 'text-gray-400'} />
                        {t.label}
                        {active && <FiChevronRight className="ml-auto text-[#e22467]" size={14} />}
                      </button>
                    );
                  })}
                </nav>

                <button
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            </aside>

            {/* ===================== CONTENT ===================== */}
            <div>
              {tab === 'Orders' && (
                <Section title="Your Orders" subtitle={orders?.length ? `${orders.length} order${orders.length === 1 ? '' : 's'}` : null}>
                  {orders === null && !ordersError ? (
                    <LineSkeleton width="100%" height={160} />
                  ) : ordersError ? (
                    <ErrorState
                      message="Could not load your orders."
                      onRetry={() =>
                        ordersApi.mine().then((res) => {
                          setOrders(res.data);
                          setOrdersError(null);
                        })
                      }
                    />
                  ) : orders.length === 0 ? (
                    <EmptyState
                      title="No orders yet"
                      message="Your placed orders will show up here."
                      action={<Link to="/shop" className="btn btn-gold">Start Shopping</Link>}
                    />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {orders.map((o) => (
                        <Link
                          to={`/account/orders/${o._id}`}
                          key={o._id}
                          className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(226,36,103,0.3)] transition-all hover:border-[#f8b4ca] hover:shadow-[0_14px_34px_-20px_rgba(226,36,103,0.35)]"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff5f8] text-[#ef6c9d]">
                            <FiPackage size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">{o.orderNumber}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {' · '}
                              {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? '' : 's'}
                            </p>
                          </div>
                          <StatusPill status={o.orderStatus} />
                          <p className="w-24 shrink-0 text-right text-sm font-bold text-gray-900">
                            {rupee(o.pricing?.grandTotal ?? 0)}
                          </p>
                          <FiChevronRight className="shrink-0 text-gray-300 transition-colors group-hover:text-[#ef6c9d]" />
                        </Link>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {tab === 'Tracking' && (
                <Section title="Track Your Order">
                  {!trackingOrder ? (
                    <EmptyState title="Nothing to track yet" message="Place an order to see live tracking here." />
                  ) : (
                    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Order {trackingOrder.orderNumber}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {rupee(trackingOrder.pricing?.grandTotal ?? 0)} · {trackingOrder.items?.length || 0} item(s)
                          </p>
                        </div>
                        <StatusPill status={trackingOrder.orderStatus} />
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => {
                          const currentIdx = STATUS_STEPS.indexOf(trackingOrder.orderStatus);
                          const done = i <= currentIdx;
                          const isLast = i === 4;
                          return (
                            <div key={s} className="flex flex-1 items-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <span
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                                    done
                                      ? 'bg-gradient-to-br from-[#f58bb1] to-[#e22467] text-white'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {done ? <FiCheck size={14} /> : i + 1}
                                </span>
                                <span className={`text-[11px] font-medium ${done ? 'text-[#ef6c9d]' : 'text-gray-400'}`}>{s}</span>
                              </div>
                              {!isLast && (
                                <div className={`mx-2 h-[2px] flex-1 rounded ${done ? 'bg-[#ef6c9d]' : 'bg-gray-200'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {tab === 'Addresses' && (
                <Section title="Saved Addresses">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {profile?.addresses?.map((a) => (
                      <div
                        key={a._id}
                        className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(226,36,103,0.3)]"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff5f8] text-[#ef6c9d]">
                            <FiMapPin size={15} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900">{a.label || 'Address'}</p>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">
                              {[a.line1, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAddress(a._id)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-red-500"
                        >
                          <FiTrash2 size={13} /> Remove
                        </button>
                      </div>
                    ))}

                    {!addressForm && (
                      <button
                        onClick={() => setAddressForm({ country: 'India' })}
                        className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 text-sm font-semibold text-gray-400 transition-colors hover:border-[#f8b4ca] hover:text-[#ef6c9d]"
                      >
                        <FiPlus size={18} />
                        Add New Address
                      </button>
                    )}
                  </div>

                  {!profile?.addresses?.length && !addressForm && (
                    <p className="mt-3 text-sm text-gray-400">No saved addresses yet — add one to speed up checkout.</p>
                  )}

                  {addressForm && (
                    <form
                      onSubmit={addAddress}
                      className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field placeholder="Label (e.g. Home)" value={addressForm.label} onChange={(v) => setAddressForm((f) => ({ ...f, label: v }))} />
                        <Field placeholder="Phone" value={addressForm.phone} onChange={(v) => setAddressForm((f) => ({ ...f, phone: v }))} />
                        <Field className="sm:col-span-2" placeholder="Address Line 1" value={addressForm.line1} onChange={(v) => setAddressForm((f) => ({ ...f, line1: v }))} required />
                        <Field placeholder="City" value={addressForm.city} onChange={(v) => setAddressForm((f) => ({ ...f, city: v }))} required />
                        <Field placeholder="State" value={addressForm.state} onChange={(v) => setAddressForm((f) => ({ ...f, state: v }))} />
                        <Field placeholder="PIN Code" value={addressForm.pincode} onChange={(v) => setAddressForm((f) => ({ ...f, pincode: v }))} required />
                        <Field placeholder="Country" value={addressForm.country || 'India'} onChange={(v) => setAddressForm((f) => ({ ...f, country: v }))} />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.3)] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {savingAddress ? 'Saving…' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressForm(null)}
                          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-[#ef6c9d] hover:text-[#ef6c9d]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </Section>
              )}

              {tab === 'Wishlist' && (
                <Section title="Your Wishlist" subtitle={wishlist.length ? `${wishlist.length} saved` : null}>
                  {wishlist.length === 0 ? (
                    <EmptyState
                      title="Nothing saved yet"
                      message="Browse the shop and tap the heart icon to save pieces here."
                      action={<Link to="/shop" className="btn btn-gold">Browse Shop</Link>}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {wishlist.map((p) => (
                        <Link
                          to={`/product/${p.id}`}
                          key={p.id}
                          className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_30px_-24px_rgba(226,36,103,0.3)] transition-shadow hover:shadow-[0_14px_34px_-20px_rgba(226,36,103,0.35)]"
                        >
                          <PhotoBlock tone={p.tone} ratio="1/1" rounded={0} strands={false} src={p.image} alt={p.name} />
                          <div className="p-3">
                            <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                            {p.price != null && <p className="mt-1 text-sm font-bold text-gray-900">{rupee(p.price)}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {tab === 'Profile' && (
                <Section title="Profile Details">
                  {/* Profile header card */}
                  <div className="mb-4 flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-gradient-to-br from-white to-[#fff5f8] p-6 text-center shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)] sm:flex-row sm:text-left">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f8b4ca] to-[#e22467] text-2xl font-bold text-white">
                      {(user.name || user.email || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-gray-900">{profileForm.name || user.name || 'Add your name'}</p>
                      <p className="truncate text-sm text-gray-500">{user.email}</p>
                      {profile?.createdAt && (
                        <p className="mt-1 text-xs font-medium text-[#ef6c9d]">
                          Member since{' '}
                          {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick account summary */}
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <SummaryStat label="Orders" value={orders?.length ?? '–'} />
                    <SummaryStat label="Wishlist" value={wishlist?.length ?? 0} />
                    <SummaryStat label="Addresses" value={profile?.addresses?.length ?? 0} />
                  </div>

                  {/* Edit form */}
                  <form
                    onSubmit={saveProfile}
                    className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(226,36,103,0.3)]"
                  >
                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <FiEdit2 size={12} />
                      Edit Details
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <LabeledField
                        icon={FiUser}
                        label="Full Name"
                        placeholder="Your full name"
                        value={profileForm.name}
                        onChange={(v) => setProfileForm((f) => ({ ...f, name: v }))}
                      />
                      <LabeledField
                        icon={FiPhone}
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        value={profileForm.phone}
                        onChange={(v) => setProfileForm((f) => ({ ...f, phone: v }))}
                      />
                      <LabeledField
                        className="sm:col-span-2"
                        icon={FiMail}
                        label="Email Address"
                        value={user.email}
                        disabled
                        hint="Your email is linked to your login and can't be changed here."
                      />
                    </div>
                    <button
                      disabled={savingProfile}
                      className="mt-5 rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(226,36,103,0.3)] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {savingProfile ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-xs font-medium text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white py-3.5 text-center shadow-[0_10px_30px_-24px_rgba(226,36,103,0.3)]">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function LabeledField({ icon: Icon, label, placeholder, value, onChange, className = '', required = false, disabled = false, hint }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#fff8fa] px-4 py-2.5 transition-colors focus-within:border-[#ef6c9d] focus-within:bg-white">
        {Icon && <Icon size={15} className="shrink-0 text-gray-400" />}
        <input
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          required={required}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:text-gray-400"
        />
      </span>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

function Field({ placeholder, value, onChange, className = '', required = false, disabled = false }) {
  return (
    <input
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      disabled={disabled}
      className={`rounded-xl border border-gray-200 bg-[#fff8fa] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-[#ef6c9d] focus:bg-white focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
    />
  );
}