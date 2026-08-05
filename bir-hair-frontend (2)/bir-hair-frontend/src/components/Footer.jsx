import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiTwitter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteContent } from '../hooks/useStoreData';

// Renders a footer link as an internal <Link> (SPA routing, no full reload) when the URL is
// relative, or a plain <a> when the admin has entered an absolute/external URL.
function FooterLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  const isExternal = /^https?:\/\//i.test(url);
  return isExternal
    ? <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
    : <Link to={url}>{children}</Link>;
}

const DEFAULT_COLUMNS = [
  { title: 'Shop', links: [{ label: 'Hair Extensions', url: '/shop' }, { label: 'Raw Hair Bundles', url: '/shop' }, { label: 'Closures & Frontals', url: '/shop' }, { label: 'Wigs & Toppers', url: '/shop' }, { label: 'Bulk Hair', url: '/shop' }] },
  { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Factory & Manufacturing', url: '/factory' }, { label: 'Export / Wholesale', url: '/wholesale' }, { label: 'Journal', url: '/journal' }, { label: 'Contact', url: '/contact' }] },
  { title: 'Support', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Shipping & Returns', url: '/policy/shipping' }, { label: 'Privacy Policy', url: '/policy/privacy' }, { label: 'Terms of Service', url: '/policy/terms' }, { label: 'My Account', url: '/account' }] },
];
const DEFAULT_TRUST_BADGES = ['100% Human Hair', 'Factory Direct', 'Worldwide Shipping', 'Secure Payments'];

export default function Footer() {
  const { siteContent: sc } = useSiteContent();
  const footer = sc?.footer || {};
  const columns = footer.columns?.length ? footer.columns : DEFAULT_COLUMNS;
  const trustBadges = footer.trustBadges?.length ? footer.trustBadges : DEFAULT_TRUST_BADGES;
  const social = footer.socialLinks || {};

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <span className="footer-logo-row">
            <span className="brand-mark footer-brand-mark">
              <span className="brand-mark-ring" />
              <span className="brand-mark-letter">B</span>
            </span>
            <span className="footer-logo">B.I.R Hair India Factory</span>
          </span>
          <p>{footer.brandDescription || 'Blessing Indian Remy Hair Exports Pvt. Ltd. — 100% human hair extensions, wigs, closures and raw bundles, manufactured and exported from Kirti Nagar, Delhi since 2014.'}</p>
          <div className="footer-social">
            {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram /></a>}
            {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook /></a>}
            {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FiYoutube /></a>}
            {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FiTwitter /></a>}
            {!social.instagram && !social.facebook && !social.whatsapp && !social.youtube && !social.twitter && (
              <>
                <a href="#" aria-label="Instagram"><FiInstagram /></a>
                <a href="#" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
                <a href="#" aria-label="YouTube"><FiYoutube /></a>
              </>
            )}
          </div>
        </div>

        {columns.map((col) => (
          <div className="footer-col" key={col.title}>
            <h5>{col.title}</h5>
            <ul>
              {(col.links || []).map((l) => (
                <li key={l.label}><FooterLink url={l.url}>{l.label}</FooterLink></li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-col">
          <h5>Factory</h5>
          <p className="footer-address">{footer.address || 'Kirti Nagar Industrial Area, New Delhi, 110015, India'}</p>
          <p className="footer-address">{footer.phone || '+91 98-XXXX-XXXX'}<br />{footer.email || 'export@birhairindia.com'}</p>
        </div>
      </div>

      <div className="container footer-trust">
        {trustBadges.map((b, i) => (
          <span key={b}>{b}{i < trustBadges.length - 1 && <span className="dot">•</span>}</span>
        ))}
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} B.I.R Hair India Factory. All rights reserved.</span>
        <span>{footer.bottomText || 'Made in Delhi, shipped worldwide.'}</span>
      </div>
    </footer>
  );
}
