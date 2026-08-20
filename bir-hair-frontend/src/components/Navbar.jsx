import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiHeart, FiUser, FiShoppingBag, FiX, FiChevronDown, FiMenu, FiPhone, FiTruck } from 'react-icons/fi';
import { megaMenu } from '../data/content';
import { useStore } from '../context/StoreContext';

const messages = [
  'Free shipping on bulk orders',
  'Factory-direct pricing — no middlemen',
  'Ships from Delhi in 24 hrs',
];

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/export', label: 'Export' },
  { to: '/about', label: 'About' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const lastY = useRef(0);
  const shopItemRef = useRef(null);
  const headerRef = useRef(null);
  const { cartCount, wishlist, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    function publishHeight() {
      const h = hidden ? 0 : (headerRef.current?.offsetHeight || 0);
      document.documentElement.style.setProperty('--navbar-h', `${h}px`);
    }
    publishHeight();
    window.addEventListener('resize', publishHeight);
    return () => window.removeEventListener('resize', publishHeight);
  }, [hidden, scrolled]);

  useEffect(() => {
    function onDocClick(e) {
      if (shopItemRef.current && !shopItemRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setMegaOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 3400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastY.current && y > 220);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <header ref={headerRef} className={`nav-wrap ${hidden ? 'nav-hidden' : ''}`}>
      {/* Row 1 — thin announcement strip */}
      <div className="nav-announce">
        <div className="container nav-announce-inner nav-announce-split">
          <span className="nav-announce-left">
            <FiPhone size={16} />
            <span>+91 9217411126</span>
            <span className="nav-announce-sep" />
            <span>+91 9999274990</span>
            <span className="nav-announce-sep" />
            <FiTruck size={16} />
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {messages[msgIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="nav-announce-right" style={{ paddingRight: 18 }}>
            <Link to="/faq">Help Center</Link>
            <span className="nav-announce-sep" />
            <Link to="/account" style={{ marginRight: 6 }}>Track Order</Link>
          </span>
        </div>
      </div>

      {/* Row 2 — logo · search · account/wishlist/cart */}
      <div className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          <button className="nav-burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <FiMenu size={24} />
          </button>

          <Link
            to="/"
            className="nav-logo"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 28,
            }}
          >
            {/* subtle glow behind the logo for extra shine/attractiveness */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 170,
                height: 120,
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(closest-side, rgba(237,33,101,0.22), rgba(237,33,101,0) 72%)',
                filter: 'blur(6px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <img
              src="/logo-full.png"
              alt="B.I.R Hair Factory India"
              style={{
                height: 80,
                width: 'auto',
                position: 'relative',
                zIndex: 1,
                filter:
                  'drop-shadow(0 6px 14px rgba(226,36,103,0.38)) drop-shadow(0 1px 0 rgba(255,255,255,0.25))',
                transition: 'transform 260ms ease, filter 260ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.045)';
                e.currentTarget.style.filter =
                  'drop-shadow(0 8px 18px rgba(226,36,103,0.5)) drop-shadow(0 1px 0 rgba(255,255,255,0.3))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter =
                  'drop-shadow(0 6px 14px rgba(226,36,103,0.38)) drop-shadow(0 1px 0 rgba(255,255,255,0.25))';
              }}
            />
          </Link>

          <form className="nav-search-inline" onSubmit={submitSearch}>
            <input
              placeholder="Search for wigs, bundles, closures…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search"><FiSearch size={20} /></button>
          </form>

          <div className="nav-icons">
            <Link className="nav-action" to={user ? '/account' : '/login'}>
              <FiUser size={22} />
              <span>Account</span>
            </Link>
            <Link className="nav-action" to="/wishlist">
              <span className="nav-action-icon">
                <FiHeart size={22} />
                {wishlist.length > 0 && <span className="nav-icon-badge">{wishlist.length}</span>}
              </span>
              <span>Wishlist</span>
            </Link>
            <Link className="nav-action nav-cart" to="/cart">
              <span className="nav-action-icon">
                <FiShoppingBag size={22} />
                {cartCount > 0 && <span className="nav-icon-badge gold">{cartCount}</span>}
              </span>
              <span>Cart</span>
            </Link>
          </div>
        </div>

        {/* Row 3 — category links */}
        <div className="nav-links-row">
          <div className="container">
            <ul className="nav-links">
              {links.map((l) => (
                l.label === 'Shop' ? (
                  <li
                    key={l.to}
                    ref={shopItemRef}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <NavLink
                      to={l.to}
                      end={l.end}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setMegaOpen((o) => !o);
                      }}
                      aria-expanded={megaOpen}
                      aria-haspopup="true"
                    >
                      {l.label}
                      <FiChevronDown size={16} className="nav-chevron" style={{ transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease', marginLeft: 4 }} />
                    </NavLink>

                    <div
                      className={`
                        absolute left-0 top-full z-40 ml-6 mt-3 w-[680px]
                        rounded-2xl border border-black/5 bg-white
                        shadow-[0_25px_60px_-15px_rgba(226,36,103,0.28)]
                        transition-all duration-250 ease-out
                        ${megaOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0 pointer-events-none'}
                      `}
                    >
                      <div className="grid grid-cols-4 gap-6 p-6">
                        {megaMenu.map((col) => (
                          <div key={col.title}>
                            <h4 className="mb-3 border-b border-[#f8b4ca]/40 pb-2 text-sm font-semibold text-gray-900">
                              {col.title}
                            </h4>
                            <ul className="space-y-2">
                              {col.items.map((it) => (
                                <li key={it}>
                                  <Link
                                    to="/shop"
                                    onClick={() => setMegaOpen(false)}
                                    className="group flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-[#ef6c9d]"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-[#f8b4ca] transition-colors group-hover:bg-[#ef6c9d]" />
                                    {it}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end rounded-b-2xl border-t border-black/5 bg-[#fff8fa] px-6 py-4">
                        <Link
                          to="/shop"
                          onClick={() => setMegaOpen(false)}
                          className="rounded-full bg-gradient-to-r from-[#f58bb1] to-[#e22467] px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(226,36,103,0.3)] transition-transform hover:scale-105"
                        >
                          View Full Shop
                        </Link>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={l.to}>
                    <NavLink to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      {l.label}
                    </NavLink>
                  </li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`nav-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="nav-drawer-top">
          <span className="nav-logo">
            <img src="/logo-full.png" alt="B.I.R Hair Factory India" style={{ height: 46, width: 'auto' }} />
          </span>
          <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="nav-drawer-close"><FiX size={22} /></button>
        </div>
        <form className="nav-drawer-search" onSubmit={(e) => { submitSearch(e); setDrawerOpen(false); }}>
          <FiSearch size={18} />
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <ul className="nav-drawer-links">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} onClick={() => setDrawerOpen(false)}>{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-drawer-cats">
          {megaMenu.map((col) => (
            <details key={col.title}>
              <summary>{col.title}</summary>
              <ul>
                {col.items.map((it) => (
                  <li key={it}><Link to="/shop" onClick={() => setDrawerOpen(false)}>{it}</Link></li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </aside>
    </header>
  );
}