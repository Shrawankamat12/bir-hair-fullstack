import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../../api/product.api.js';
import { Button } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatCurrency } from '../../lib/format.js';

/** Storefront-style read-only preview — how the product will look to customers before publishing. */
export default function ProductPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getOne(id).then(setProduct).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading preview…" />;
  if (!product) return <EmptyState title="Product not found" />;

  const gallery = product.gallery || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back to Editing</Button>
        <span className="text-[12px] text-ink-faint font-semibold uppercase tracking-wide">Storefront Preview</span>
      </div>
      <div className="bg-white rounded-lg border border-border-soft shadow-sm p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-surface-muted rounded-lg overflow-hidden mb-3">
              {gallery[0] ? <img src={gallery[0].url} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="flex gap-2">
              {gallery.slice(1, 5).map((g, i) => <img key={i} src={g.url} className="h-16 w-16 rounded-md object-cover border border-border-soft" />)}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-magenta font-bold mb-1">{product.hairType || 'Hair Extensions'}</p>
            <h1 className="font-heading text-2xl font-bold text-ink mb-2">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">{formatCurrency(product.discountPrice || product.price)}</span>
              {product.discountPrice && <span className="text-ink-faint line-through">{formatCurrency(product.price)}</span>}
            </div>
            <p className="text-[13.5px] text-ink-muted leading-relaxed mb-4">{product.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[product.hairTexture, product.hairLength, product.hairColour, product.weight].filter(Boolean).map((a) => (
                <span key={a} className="px-2.5 py-1 rounded-full bg-surface-muted text-[11.5px] font-medium">{a}</span>
              ))}
            </div>
            <Button className="w-full">Add to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
