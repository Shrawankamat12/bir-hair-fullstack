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

  // Publish the navbar's live height as a CSS var so sticky in-page toolbars
  // (e.g. the Shop filter/sort bar) can offset themselves correctly instead
  // of guessing a fixed pixel value.
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
            <FiPhone /> <span>+1 (234) 567-8900</span>
            <span className="nav-announce-sep" />
            <FiTruck />
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
          <span className="nav-announce-right">
            <Link to="/faq">Help Center</Link>
            <span className="nav-announce-sep" />
            <Link to="/account">Track Order</Link>
          </span>
        </div>
      </div>

      {/* Row 2 — logo · search · account/wishlist/cart */}
      <div className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          <button className="nav-burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <FiMenu />
          </button>

          <Link to="/" className="nav-logo">
            <span className="brand-mark nav-brand-mark">
              <span className="brand-mark-ring" />
              <span className="brand-mark-letter">B</span>
            </span>
            <span className="nav-logo-text">
              <span className="nav-logo-mark">B.I.R Hair</span>
              <span className="nav-logo-full">Hair India Factory</span>
            </span>
          </Link>

          <form className="nav-search-inline" onSubmit={submitSearch}>
            <input
              placeholder="Search for wigs, bundles, closures…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search"><FiSearch /></button>
          </form>

          <div className="nav-icons">
            <Link className="nav-action" to={user ? '/account' : '/login'}>
              <FiUser />
              <span>Account</span>
            </Link>
            <Link className="nav-action" to="/wishlist">
              <span className="nav-action-icon">
                <FiHeart />
                {wishlist.length > 0 && <span className="nav-icon-badge">{wishlist.length}</span>}
              </span>
              <span>Wishlist</span>
            </Link>
            <Link className="nav-action nav-cart" to="/cart">
              <span className="nav-action-icon">
                <FiShoppingBag />
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
                      <FiChevronDown className="nav-chevron" style={{ transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease', marginLeft: 4 }} />
                    </NavLink>
                    <div className={`mega-menu glass ${megaOpen ? 'open' : ''}`}>
                      <div className="mega-menu-grid">
                        {megaMenu.map((col) => (
                          <div className="mega-col" key={col.title}>
                            <div className="mega-col-thumb" style={col.img ? { backgroundImage: `url(${col.img})` } : undefined} />
                            <h4>{col.title}</h4>
                            <ul>
                              {col.items.map((it) => (
                                <li key={it}>
                                  <Link to="/shop" onClick={() => setMegaOpen(false)}>{it}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mega-menu-foot">
                        <Link to="/shop" className="btn btn-gold btn-sm" onClick={() => setMegaOpen(false)}>View Full Shop</Link>
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
            <span className="brand-mark nav-brand-mark" style={{ '--bm-size': '36px' }}>
              <span className="brand-mark-ring" />
              <span className="brand-mark-letter">B</span>
            </span>
            <span className="nav-logo-mark">B.I.R</span>
          </span>
          <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="nav-drawer-close"><FiX /></button>
        </div>
        <form className="nav-drawer-search" onSubmit={(e) => { submitSearch(e); setDrawerOpen(false); }}>
          <FiSearch />
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
