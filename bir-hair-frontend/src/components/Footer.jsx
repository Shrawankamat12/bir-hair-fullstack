import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp, FaPinterestP, FaTiktok } from 'react-icons/fa';
import { useSiteContent } from '../hooks/useStoreData';

function FooterLink({ url, children }) {
  if (!url) return <span>{children}</span>;
  const isExternal = /^https?:\/\//i.test(url);
  return isExternal ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link to={url}>{children}</Link>
  );
}

const DEFAULT_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Hair Extensions', url: '/shop' },
      { label: 'Raw Hair Bundles', url: '/shop' },
      { label: 'Closures & Frontals', url: '/shop' },
      { label: 'Wigs & Toppers', url: '/shop' },
      { label: 'Bulk Hair', url: '/shop' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', url: '/about' },
      { label: 'Factory & Manufacturing', url: '/factory' },
      { label: 'Export / Wholesale', url: '/wholesale' },
      { label: 'Journal', url: '/journal' },
      { label: 'Contact', url: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', url: '/faq' },
      { label: 'Shipping & Returns', url: '/policy/shipping' },
      { label: 'Privacy Policy', url: '/policy/privacy' },
      { label: 'Terms of Service', url: '/policy/terms' },
      { label: 'My Account', url: '/account' },
    ],
  },
];

const DEFAULT_TRUST_BADGES = [
  '100% Human Hair',
  'Factory Direct',
  'Worldwide Shipping',
  'Secure Payments',
];

const DEFAULT_FOOTER = {
  brandDescription:
    'Blessing Indian Remy Hair Exports Private Limited - premium 100% human hair extensions, wigs, closures, frontals and raw hair, manufactured and exported from our factory in Kirti Nagar, New Delhi.',
  address:
    '71/7 A-18, Rama Road, Kirti Nagar Industrial Area, Opposite Kirti Nagar Metro Station, New Delhi - 110015, Delhi, India',
  email: 'birhairfactory@gmail.com',
  phones: ['+91 9217411126', '+91 9999274990', '+91 9958871126'],
  socialLinks: {
    instagram: 'https://www.instagram.com/bir_indian_raw_hair_factory?igsh=MXZmNGhjNzB1eWJncQ%3D%3D&utm_source=qr',
    facebook: 'https://www.facebook.com/share/17t6fEtW1e/?mibextid=wwXIfr',
    pinterest: 'https://pin.it/4ovPJmUl8',
    tiktok: 'https://www.tiktok.com/@birhairfactory_india?_r=1&_t=ZN-9945zqCRxri',
    youtube: 'https://youtube.com/@birhairfactoryindia?si=FdoqgYexs4zIlIvG',
    whatsapp: 'https://wa.me/919217411126',
  },
};

const SOCIAL_ICONS = [
  { key: 'instagram', label: 'Instagram', Icon: FiInstagram },
  { key: 'facebook', label: 'Facebook', Icon: FiFacebook },
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'youtube', label: 'YouTube', Icon: FiYoutube },
  { key: 'pinterest', label: 'Pinterest', Icon: FaPinterestP },
  { key: 'tiktok', label: 'TikTok', Icon: FaTiktok },
];

export default function Footer() {
  const { siteContent: sc } = useSiteContent();
  const footer = sc?.footer || {};
  const columns = footer.columns?.length ? footer.columns : DEFAULT_COLUMNS;
  const trustBadges = footer.trustBadges?.length ? footer.trustBadges : DEFAULT_TRUST_BADGES;

  const social = { ...DEFAULT_FOOTER.socialLinks };
  Object.entries(footer.socialLinks || {}).forEach(function (entry) {
    var k = entry[0];
    var v = entry[1];
    if (v) {
      social[k] = v;
    }
  });

  const brandDescription = footer.brandDescription || DEFAULT_FOOTER.brandDescription;
  const address = footer.address || DEFAULT_FOOTER.address;
  const email = footer.email || DEFAULT_FOOTER.email;
  const phones = footer.phones?.length ? footer.phones : DEFAULT_FOOTER.phones;

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <div className="flex justify-center w-full mb-3 -ml-7">
            <img
              src="/logo-full.png"
              alt="B.I.R Hair India Factory"
              className="w-[100px] h-[100px] object-contain"
            />
          </div>

          <p>{brandDescription}</p>

          <div className="footer-social">
            {SOCIAL_ICONS.map(function (item) {
              var url = social[item.key];
              if (!url) {
                return null;
              }
              var IconComp = item.Icon;
              return (
                <a
                  key={item.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  title={item.label}
                >
                  <IconComp />
                </a>
              );
            })}
          </div>
        </div>

        {columns.map(function (col) {
          return (
            <div className="footer-col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {(col.links || []).map(function (l) {
                  return (
                    <li key={l.label}>
                      <FooterLink url={l.url}>{l.label}</FooterLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="footer-col">
          <h5>Factory & Contact</h5>

          <p className="footer-address">
            <strong>Factory Address</strong>
            <br />
            {address}
          </p>

          <p className="footer-address">
            <strong>Email</strong>
            <br />
            <a href={'mailto:' + email} className="footer-contact-link">{email}</a>
          </p>

          <p className="footer-address">
            <strong>Phone</strong>
            <br />
            {phones.map(function (phone) {
              var cleanPhone = phone.replace(/[\s()-]+/g, '');
              return (
                <span key={phone} className="footer-phone">
                  <a href={'tel:' + cleanPhone} className="footer-contact-link">{phone}</a>
                  <br />
                </span>
              );
            })}
          </p>
        </div>
      </div>

      <div className="container footer-trust">
        {trustBadges.map(function (badge, index) {
          return (
            <span key={badge}>
              {badge}
              {index < trustBadges.length - 1 ? <span className="dot">•</span> : null}
            </span>
          );
        })}
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} B.I.R Hair India Factory. All rights reserved.</span>
        <span>{footer.bottomText || 'Made in Delhi, India • Exported Worldwide'}</span>
      </div>
    </footer>
  );
}