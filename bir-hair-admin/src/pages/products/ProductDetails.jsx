import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../../api/product.api.js';
import { PageHeader, Card, Button, Badge, StatusBadge } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate, stockStatus } from '../../lib/format.js';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    productApi.getOne(id).then((data) => setProduct(data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading product…" />;
  if (!product) return <EmptyState title="Product not found" />;

  const gallery = product.gallery || [];
  const s = stockStatus(product.stock, product.minStock);

  return (
    <div>
      <PageHeader
        title={product.name}
        breadcrumbs={[{ label: 'Products', to: '/products' }, { label: product.name }]}
        actions={<>
          <Button variant="secondary" onClick={() => navigate('/products')}>Back to List</Button>
          <Button variant="secondary" onClick={() => navigate(`/products/${id}/preview`)}>Preview</Button>
          <Button onClick={() => navigate(`/products/${id}/edit`)}>Edit Product</Button>
        </>}
      />

      <div className="grid grid-cols-3 gap-5 items-start">
        <div className="col-span-3 lg:col-span-2 flex flex-col gap-5">
          <Card>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 w-16">
                {gallery.map((g, i) => (
                  <img key={i} src={g.url} onClick={() => setActiveImg(i)} className={`h-14 w-14 rounded-md object-cover border cursor-pointer ${activeImg === i ? 'border-brand-magenta' : 'border-border-soft'}`} />
                ))}
              </div>
              <div className="flex-1 aspect-square max-h-96 bg-surface-muted rounded-lg overflow-hidden flex items-center justify-center">
                {gallery[activeImg] ? <img src={gallery[activeImg].url} className="h-full w-full object-cover" /> : <span className="text-ink-faint text-sm">No images</span>}
              </div>
            </div>
            {product.video && (
              <a href={product.video} target="_blank" rel="noreferrer" className="inline-block mt-3 text-brand-magenta text-sm font-semibold hover:underline">▶ View product video</a>
            )}
          </Card>

          <Card title="Description">
            <p className="text-[13.5px] text-ink-muted leading-relaxed whitespace-pre-line">{product.description || '—'}</p>
          </Card>

          {product.specifications && (
            <Card title="Specifications">
              <p className="text-[13.5px] text-ink-muted leading-relaxed whitespace-pre-line">{product.specifications}</p>
            </Card>
          )}

          {product.hasVariants && product.variants?.length > 0 && (
            <Card title="Variants" padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="bg-surface-muted text-left text-[11px] uppercase text-ink-muted">
                    {['Length', 'Colour', 'Texture', 'Weight', 'Density', 'SKU', 'Price', 'Stock'].map((h) => <th key={h} className="px-3.5 py-2.5">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {product.variants.map((v, i) => (
                      <tr key={i} className="border-t border-border-soft">
                        <td className="px-3.5 py-2">{v.length || '—'}</td><td className="px-3.5 py-2">{v.colour || '—'}</td>
                        <td className="px-3.5 py-2">{v.texture || '—'}</td><td className="px-3.5 py-2">{v.weight || '—'}</td>
                        <td className="px-3.5 py-2">{v.density || '—'}</td><td className="px-3.5 py-2"><code className="text-xs">{v.sku}</code></td>
                        <td className="px-3.5 py-2">{formatCurrency(v.price)}</td><td className="px-3.5 py-2">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card title="Shipping & Policies">
            <div className="flex flex-col gap-3 text-[13.5px] text-ink-muted">
              <div><span className="font-semibold text-ink">Shipping: </span>{product.shippingInfo || '—'}</div>
              <div><span className="font-semibold text-ink">Care Instructions: </span>{product.careInstructions || '—'}</div>
              <div><span className="font-semibold text-ink">Return Policy: </span>{product.returnPolicy || '—'}</div>
            </div>
          </Card>
        </div>

        <div className="col-span-3 lg:col-span-1 flex flex-col gap-5">
          <Card title="Pricing">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink">{formatCurrency(product.discountPrice || product.price)}</span>
              {product.discountPrice && <span className="text-sm text-ink-faint line-through">{formatCurrency(product.price)}</span>}
            </div>
            <div className="text-[12px] text-ink-faint mt-1">Cost Price: {formatCurrency(product.costPrice)}</div>
          </Card>

          <Card title="Inventory">
            <div className="flex justify-between text-[13.5px] mb-2"><span className="text-ink-faint">Stock</span><span className={`font-bold ${s === 'ok' ? 'text-success' : s === 'low' ? 'text-warning' : 'text-danger'}`}>{product.stock ?? 0} units</span></div>
            <div className="flex justify-between text-[13.5px]"><span className="text-ink-faint">Minimum Stock</span><span className="font-medium">{product.minStock ?? 0}</span></div>
          </Card>

          <Card title="Attributes">
            <div className="grid grid-cols-2 gap-2 text-[12.5px]">
              {['hairType', 'hairTexture', 'hairLength', 'hairColour', 'hairDensity', 'hairOrigin', 'weight'].map((k) => (
                product[k] ? <Badge key={k} tone="neutral">{product[k]}</Badge> : null
              ))}
            </div>
          </Card>

          <Card title="Status">
            <div className="flex flex-col gap-2">
              <StatusBadge status={product.status ? 'active' : 'inactive'} />
              {product.featured && <Badge tone="brand">Featured</Badge>}
            </div>
          </Card>

          <Card title="Record Info">
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between border-b border-border-soft pb-2"><span className="text-ink-faint">Created</span><span className="font-medium">{formatDate(product.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-ink-faint">Updated</span><span className="font-medium">{formatDate(product.updatedAt)}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
