import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import { LineSkeleton } from '../components/Skeletons';
import { EmptyState, ErrorState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { rupee } from '../lib/format';
import { authApi, ordersApi, usersApi } from '../lib/resources';
import './Account.css';

const TABS = ['Orders', 'Tracking', 'Addresses', 'Wishlist', 'Profile'];
const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

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

  const trackingOrder = orders?.find((o) => !['delivered', 'cancelled', 'returned'].includes(o.status)) || orders?.[0];

  return (
    <>
      <PageHeader crumbs={[{ label: 'My Account' }]} title="My Account" lede="Manage your orders, addresses and saved pieces." />
      <div className="section account-section">
        <div className="container account-layout">
          <aside className="account-sidebar card">
            <div className="account-profile">
              <div className="account-avatar">{(user.name || user.email || '?').trim().charAt(0).toUpperCase()}</div>
              <div><strong>{user.name}</strong><span>{user.email}</span></div>
            </div>
            <ul>
              {TABS.map((t) => (
                <li key={t}><button className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button></li>
              ))}
            </ul>
            <button className="account-logout" onClick={handleLogout}>Sign Out</button>
          </aside>

          <div className="account-content">
            {tab === 'Orders' && (
              <div className="account-orders">
                {orders === null && !ordersError ? (
                  <LineSkeleton width="100%" height={160} />
                ) : ordersError ? (
                  <ErrorState message="Could not load your orders." onRetry={() => ordersApi.mine().then((res) => { setOrders(res.data); setOrdersError(null); })} />
                ) : orders.length === 0 ? (
                  <EmptyState title="No orders yet" message="Your placed orders will show up here." action={<Link to="/shop" className="btn btn-gold">Start Shopping</Link>} />
                ) : (
                  orders.map((o) => (
                    <div className="account-order card" key={o._id}>
                      <div>
                        <strong>{o.orderNumber}</strong>
                        <span className="account-order-date">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {o.items.length} item(s)</span>
                      </div>
                      <span className={`account-status ${o.status === 'delivered' ? 'delivered' : 'transit'}`} style={{ textTransform: 'capitalize' }}>{o.status}</span>
                      <span className="price-now">{rupee(o.total)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'Tracking' && (
              <div className="account-tracking card">
                {!trackingOrder ? (
                  <EmptyState title="Nothing to track yet" message="Place an order to see live tracking here." />
                ) : (
                  <>
                    <h3>Order {trackingOrder.orderNumber}</h3>
                    <div className="track-steps">
                      {['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((s, i) => (
                        <div key={s} className={`track-step ${i <= STATUS_STEPS.indexOf(trackingOrder.status) ? 'done' : ''}`}>
                          <span className="track-dot" /><span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'Addresses' && (
              <div className="account-addresses">
                {profile?.addresses?.map((a) => (
                  <div className="card account-address-card" key={a._id}>
                    <strong>{a.label || 'Address'}</strong>
                    <p>{[a.line1, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')}</p>
                    <button className="btn btn-outline on-light btn-sm" onClick={() => deleteAddress(a._id)}>Remove</button>
                  </div>
                ))}
                {!profile?.addresses?.length && <p style={{ marginBottom: 16 }}>No saved addresses yet.</p>}

                {addressForm ? (
                  <form className="checkout-form card" onSubmit={addAddress} style={{ marginTop: 16 }}>
                    <div className="checkout-grid">
                      <input placeholder="Label (e.g. Home)" value={addressForm.label || ''} onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))} />
                      <input placeholder="Phone" value={addressForm.phone || ''} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} />
                      <input placeholder="Address Line 1" className="span-2" value={addressForm.line1 || ''} onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))} required />
                      <input placeholder="City" value={addressForm.city || ''} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} required />
                      <input placeholder="State" value={addressForm.state || ''} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} />
                      <input placeholder="PIN Code" value={addressForm.pincode || ''} onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))} required />
                      <input placeholder="Country" value={addressForm.country || 'India'} onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button type="submit" className="btn btn-gold btn-sm" disabled={savingAddress}>{savingAddress ? 'Saving…' : 'Save Address'}</button>
                      <button type="button" className="btn btn-outline on-light btn-sm" onClick={() => setAddressForm(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button className="btn btn-dark btn-sm" onClick={() => setAddressForm({ country: 'India' })}>+ Add New Address</button>
                )}
              </div>
            )}

            {tab === 'Wishlist' && (
              <div className="account-wishlist-grid">
                {wishlist.length === 0 ? <p>Nothing saved yet — browse the shop to add pieces.</p> :
                  wishlist.map((p) => (
                    <Link to={`/product/${p.id}`} key={p.id} className="card account-wish-item">
                      <PhotoBlock tone={p.tone} ratio="1/1" rounded={12} strands={false} src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </Link>
                  ))}
              </div>
            )}

            {tab === 'Profile' && (
              <form className="checkout-form card account-profile-form" onSubmit={saveProfile}>
                <div className="checkout-grid">
                  <input placeholder="Full Name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                  <input placeholder="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                  <input placeholder="Email Address" defaultValue={user.email} className="span-2" disabled />
                </div>
                <button className="btn btn-gold" style={{ marginTop: 16 }} disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save Changes'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
