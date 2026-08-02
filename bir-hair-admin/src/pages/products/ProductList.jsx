import { useNavigate } from 'react-router-dom';
import productApi from '../../api/product.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { StatusBadge, Badge } from '../../components/ui/index.js';
import { formatCurrency, stockStatus } from '../../lib/format.js';
import { resolveMediaUrl } from '../../lib/media.js';

export default function ProductList() {
  const navigate = useNavigate();
  const entity = useEntityList(productApi, { searchKeys: ['name', 'sku'] });

  const columns = [
    { key: 'image', label: 'Image', render: (r) => {
      const img = r.gallery?.find((g) => g.isPrimary)?.url || r.gallery?.[0]?.url;
      return img ? <img src={resolveMediaUrl(img)} className="h-10 w-10 rounded-md object-cover border border-border-soft" /> : <div className="h-10 w-10 rounded-md bg-surface-muted" />;
    } },
    { key: 'name', label: 'Product', sortable: true, render: (r) => <span className="font-semibold cursor-pointer hover:text-brand-magenta" onClick={() => navigate(`/products/${r._id || r.id}`)}>{r.name}</span> },
    { key: 'sku', label: 'SKU', render: (r) => <code className="text-xs">{r.sku}</code> },
    { key: 'price', label: 'Price', sortable: true, render: (r) => (
      <div>
        <div className="font-semibold">{formatCurrency(r.discountPrice || r.price)}</div>
        {r.discountPrice ? <div className="text-[11px] text-ink-faint line-through">{formatCurrency(r.price)}</div> : null}
      </div>
    ) },
    { key: 'stock', label: 'Stock', sortable: true, render: (r) => {
      const s = stockStatus(r.stock, r.minStock);
      return <span className={`stock-badge ${s} inline-block px-2.5 py-1 rounded-full text-[11.5px] font-bold ${s === 'ok' ? 'bg-[#e7f7ee] text-[#1c8a4b]' : s === 'low' ? 'bg-[#fff4e0] text-[#b3760a]' : 'bg-[#fde8e8] text-[#c22b2b]'}`}>{r.stock ?? 0}</span>;
    } },
    { key: 'featured', label: 'Featured', render: (r) => r.featured ? <Badge tone="brand">Featured</Badge> : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
  ];

  return (
    <EntityListPage
      title="Products"
      subtitle="Full catalog of hair products with variants, pricing and inventory."
      entity={entity}
      columns={columns}
      onAdd={() => navigate('/products/new')}
      addLabel="Add Product"
      onEdit={(row) => navigate(`/products/${row._id || row.id}/edit`)}
      onView={(row) => navigate(`/products/${row._id || row.id}`)}
      filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] }]}
      statusOptions={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}
    />
  );
}