import { Link } from 'react-router-dom';
import './Content.css';

export default function NotFound() {
  return (
    <div className="notfound-wrap">
      <div className="empty-state-icon" style={{ width: 72, height: 72, marginBottom: 22 }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M9.5 9.5c.3-1 1.2-1.5 2.3-1.5 1.3 0 2.2.7 2.2 1.8 0 1.6-2.2 1.5-2.2 3.2" /><circle cx="12" cy="16.4" r="0.6" fill="currentColor" />
        </svg>
      </div>
      <span className="notfound-num">404</span>
      <h1 style={{ margin: '10px 0 12px' }}>This page took a wrong turn</h1>
      <p style={{ color: 'rgba(74,44,42,0.6)', marginBottom: 26 }}>The page you're looking for doesn't exist, or has moved.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-gold">Back to Home</Link>
        <Link to="/shop" className="btn btn-outline on-light">Browse Shop</Link>
      </div>
    </div>
  );
}
