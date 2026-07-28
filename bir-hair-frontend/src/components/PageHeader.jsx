import { Link } from 'react-router-dom';
import './PageHeader.css';

export default function PageHeader({ crumbs = [], title, lede }) {
  return (
    <div className="pageheader">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="crumb-sep">/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </div>
        <h1 className="pageheader-title">{title}</h1>
        {lede && <p className="pageheader-lede">{lede}</p>}
      </div>
    </div>
  );
}
