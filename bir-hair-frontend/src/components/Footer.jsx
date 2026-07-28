import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
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
          <p>Blessing Indian Remy Hair Exports Pvt. Ltd. — 100% human hair extensions, wigs, closures and raw bundles, manufactured and exported from Kirti Nagar, Delhi since 2014.</p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="WhatsApp">WA</a>
            <a href="#" aria-label="YouTube">YT</a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><Link to="/shop">Hair Extensions</Link></li>
            <li><Link to="/shop">Raw Hair Bundles</Link></li>
            <li><Link to="/shop">Closures &amp; Frontals</Link></li>
            <li><Link to="/shop">Wigs &amp; Toppers</Link></li>
            <li><Link to="/shop">Bulk Hair</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/factory">Factory &amp; Manufacturing</Link></li>
            <li><Link to="/wholesale">Export / Wholesale</Link></li>
            <li><Link to="/journal">Journal</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Support</h5>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/policy/shipping">Shipping &amp; Returns</Link></li>
            <li><Link to="/policy/privacy">Privacy Policy</Link></li>
            <li><Link to="/policy/terms">Terms of Service</Link></li>
            <li><Link to="/account">My Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Factory</h5>
          <p className="footer-address">Kirti Nagar Industrial Area,<br/>New Delhi, 110015, India</p>
          <p className="footer-address">+91 98-XXXX-XXXX<br/>export@birhairindia.com</p>
        </div>
      </div>

      <div className="container footer-trust">
        <span>100% Human Hair</span><span className="dot">•</span>
        <span>Factory Direct</span><span className="dot">•</span>
        <span>Worldwide Shipping</span><span className="dot">•</span>
        <span>Secure Payments</span>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} B.I.R Hair India Factory. All rights reserved.</span>
        <span>Made in Delhi, shipped worldwide.</span>
      </div>
    </footer>
  );
}
