import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';
import { rupee } from '../lib/format';
import StarRating from './StarRating';

export default function CompareTray() {
  const { items, removeCompare, clearCompare, drawerOpen, setDrawerOpen } = useCompare();

  if (items.length === 0 && !drawerOpen) return null;

  const rows = [
    { label: 'Price', get: (p) => rupee(p.price) },
    { label: 'Hair Type', get: (p) => p.hairType || '—' },
    { label: 'Texture', get: (p) => p.texture || '—' },
    { label: 'Length', get: (p) => (p.length ? `${p.length}"` : '—') },
    { label: 'Weight', get: (p) => p.weight || '—' },
    { label: 'Rating', get: (p) => `${p.rating || 0} (${p.reviews || 0})` },
    { label: 'Stock', get: (p) => (p.stock > 0 ? 'In stock' : 'Out of stock') },
  ];

  return (
    <>
      <div className={`compare-tray ${items.length > 0 ? 'open' : ''}`}>
        <div className="compare-tray-thumbs">
          {items.map((p) => (
            <span className="compare-tray-thumb" key={p.id}>
              {p.image && <img src={p.image} alt={p.name} />}
              <button onClick={() => removeCompare(p.id)} aria-label={`Remove ${p.name}`}><FiX /></button>
            </span>
          ))}
        </div>
        <span className="compare-tray-label">{items.length} of 4 selected</span>
        <div className="compare-tray-actions">
          <button className="btn btn-gold btn-sm" disabled={items.length < 2} onClick={() => setDrawerOpen(true)}>Compare</button>
          <button className="btn btn-outline btn-sm" onClick={clearCompare}>Clear</button>
        </div>
      </div>

      <div className={`overlay-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`compare-drawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Compare products">
        <div className="container compare-drawer-head" style={{ padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Compare Products</h2>
          <button className="qv-close" style={{ position: 'static' }} onClick={() => setDrawerOpen(false)} aria-label="Close compare"><FiX /></button>
        </div>
        <div className="container" style={{ paddingBottom: 60 }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--stone)' }}>Add products to compare from the shop grid.</p>
          ) : (
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th></th>
                    {items.map((p) => (
                      <th key={p.id} className="compare-col-head">
                        {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />}
                        <Link to={`/product/${p.id}`} style={{ fontWeight: 700, color: 'var(--brown)', display: 'block' }} onClick={() => setDrawerOpen(false)}>{p.name}</Link>
                        <StarRating value={p.rating} size={12} />
                        <button className="compare-remove" onClick={() => removeCompare(p.id)}>Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      {items.map((p) => <td key={p.id}>{row.get(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
