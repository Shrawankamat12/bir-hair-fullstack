import { useMemo, useState } from 'react';
import PhotoBlock from './PhotoBlock';
import { rupee } from '../lib/format';
import { useStore } from '../context/StoreContext';

export default function FrequentlyBoughtTogether({ product, pool }) {
  const { addToCart } = useStore();

  const companions = useMemo(
    () => (pool || []).filter((p) => p.id !== product.id).slice(0, 2),
    [pool, product.id]
  );

  const all = [product, ...companions];
  const [checked, setChecked] = useState(() => new Set(all.map((p) => p.id)));

  if (companions.length === 0) return null;

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const selected = all.filter((p) => checked.has(p.id));
  const total = selected.reduce((n, p) => n + p.price, 0);

  return (
    <div className="card" style={{ padding: 'clamp(20px,3vw,28px)' }}>
      <span className="eyebrow">Frequently Bought Together</span>
      <div className="fbt-row" style={{ marginTop: 16 }}>
        {all.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="fbt-card">
              <PhotoBlock tone={p.tone} ratio="1/1" rounded={14} src={p.image} alt={p.name} />
              <p style={{ fontSize: '0.75rem', marginTop: 8, lineHeight: 1.3 }}>{p.name}</p>
              <span className="price-now" style={{ fontSize: '0.85rem' }}>{rupee(p.price)}</span>
            </div>
            {i < all.length - 1 && <span className="fbt-plus">+</span>}
          </div>
        ))}
      </div>

      <div className="fbt-checklist">
        {all.map((p) => (
          <label key={p.id}>
            <input type="checkbox" checked={checked.has(p.id)} onChange={() => toggle(p.id)} />
            {p.name} — <strong>{rupee(p.price)}</strong>
          </label>
        ))}
      </div>

      <div className="fbt-total">
        <span>Total for {selected.length} item{selected.length !== 1 ? 's' : ''}: <strong className="price-now">{rupee(total)}</strong></span>
        <button
          className="btn btn-gold btn-sm"
          disabled={selected.length === 0}
          onClick={() => selected.forEach((p) => addToCart(p, 1))}
        >
          Add {selected.length} to Cart
        </button>
      </div>
    </div>
  );
}
