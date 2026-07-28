import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { megaMenu } from '../data/content';
import { useStore } from '../context/StoreContext';
import './Navbar.css';

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
  const [searchOpen, setSearchOpen] = useState(false);
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
      setHidden(y > lastY.current && y > 160);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <header ref={headerRef} className={`nav-wrap ${hidden ? 'nav-hidden' : ''}`}>
      <div className="nav-announce">
        <div className="container nav-announce-inner">
          <span key={msgIndex} className="nav-announce-msg">{messages[msgIndex]}</span>
        </div>
      </div>

      <nav className={`navbar glass ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          <button className="nav-burger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>

          <Link to="/" className="nav-logo">
            <span className="brand-mark nav-brand-mark">
              <span className="brand-mark-ring" />
              <span className="brand-mark-letter">B</span>
            </span>
            <span className="nav-logo-text">
              <span className="nav-logo-mark">B.I.R</span>
              <span className="nav-logo-full">Hair India Factory</span>
            </span>
          </Link>

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
                    <ChevronIcon open={megaOpen} />
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

          <div className="nav-icons">
            <button className="nav-icon-btn" aria-label="Search" onClick={() => setSearchOpen((s) => !s)}>
              <SearchIcon />
            </button>
            <Link className="nav-icon-btn" to="/wishlist" aria-label="Wishlist">
              <HeartIcon />
              {wishlist.length > 0 && <span className="nav-icon-badge">{wishlist.length}</span>}
            </Link>
            <Link className="nav-icon-btn" to={user ? '/account' : '/login'} aria-label="Account">
              <UserIcon />
            </Link>
            <Link className="nav-icon-btn nav-cart" to="/cart" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && <span className="nav-icon-badge gold">{cartCount}</span>}
            </Link>
            <Link to="/shop" className="btn btn-gold btn-sm nav-cta">Shop Now</Link>
          </div>
        </div>

        <div className={`nav-search-bar ${searchOpen ? 'open' : ''}`}>
          <form className="container nav-search-form" onSubmit={submitSearch}>
            <SearchIcon />
            <input
              autoFocus={searchOpen}
              placeholder="Search bundles, wigs, frontals…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-gold btn-sm">Search</button>
          </form>
        </div>
      </nav>

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
          <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="nav-drawer-close">✕</button>
        </div>
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

function ChevronIcon({ open }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="nav-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease', marginLeft: 4 }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  );
}
function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.9-10-9.3C.6 8.4 2.2 4.5 6 4c2.2-.3 4 .9 6 3.2C14 4.9 15.8 3.7 18 4c3.8.5 5.4 4.4 4 7.7C19.5 16.1 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8"/></svg>
  );
}
function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c1.8-4 5-6 8-6s6.2 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  );
}
function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="18" cy="21" r="1.4" fill="currentColor"/></svg>
  );
}
