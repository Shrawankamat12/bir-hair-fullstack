import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const staticNotifications = [
  { id: 1, title: 'New order placed', time: '5 min ago' },
  { id: 2, title: 'Product stock is running low', time: '1 hour ago' },
  { id: 3, title: 'New wholesale enquiry received', time: 'Yesterday' },
];

function initials(name) {
  if (!name) return 'A';
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Search orders, products, customers..." />
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-dropdown-wrap" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="badge-dot" />
          </button>
          {notifOpen && (
            <div className="admin-dropdown notif-dropdown">
              <div className="admin-dropdown-header">
                <div className="u-name">Notifications</div>
              </div>
              <div className="notif-list">
                {staticNotifications.map((n) => (
                  <div className="notif-item" key={n.id}>
                    <span className="notif-dot" />
                    <div className="notif-text">
                      <span className="t">{n.title}</span>
                      <span className="time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="admin-dropdown-wrap" ref={userRef}>
          <button className="admin-topbar-user" onClick={() => setUserOpen((v) => !v)}>
            <span className="admin-avatar">{initials(user?.name)}</span>
            <div className="admin-topbar-user-info">
              <div className="u-name">{user?.name || 'Admin'}</div>
              <div className="u-role">{user?.role || 'admin'}</div>
            </div>
            <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {userOpen && (
            <div className="admin-dropdown">
              <div className="admin-dropdown-header">
                <div className="u-name">{user?.name || 'Admin'}</div>
                <div className="u-email">{user?.email || ''}</div>
              </div>
              <button className="admin-dropdown-item" onClick={() => navigate('/settings')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                Settings
              </button>
              <button className="admin-dropdown-item danger" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
