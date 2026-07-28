import { useState } from 'react';
import productApi from '../../api/product.api.js';
import inventoryApi from '../../api/inventory.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Tabs, Modal, Button, Input, FormField, Select, StatGrid } from '../../components/ui/index.js';
import { useToast, EmptyState } from '../../components/ui/Feedback.jsx';
import { Drawer } from '../../components/ui/Overlay.jsx';
import { stockStatus } from '../../lib/format.js';

const TABS = [
  { value: 'all', label: 'All Inventory' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
];

export default function InventoryList() {
  const [tab, setTab] = useState('all');
  const entity = useEntityList(productApi, { searchKeys: ['name', 'sku'] });
  const toast = useToast();
  const [adjustRow, setAdjustRow] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [historyRow, setHistoryRow] = useState(null);

  const visibleRows = tab === 'all' ? entity.allRows
    : tab === 'low' ? entity.allRows.filter((r) => stockStatus(r.stock, r.minStock) === 'low')
    : entity.allRows.filter((r) => stockStatus(r.stock, r.minStock) === 'out');

  const counts = {
    total: entity.allRows.length,
    low: entity.allRows.filter((r) => stockStatus(r.stock, r.minStock) === 'low').length,
    out: entity.allRows.filter((r) => stockStatus(r.stock, r.minStock) === 'out').length,
  };

  const scopedEntity = { ...entity, rows: visibleRows.slice((entity.page - 1) * entity.pageSize, entity.page * entity.pageSize), totalItems: visibleRows.length, allFiltered: visibleRows, totalPages: Math.max(1, Math.ceil(visibleRows.length / entity.pageSize)) };

  const columns = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU', render: (r) => <code className="text-xs">{r.sku}</code> },
    { key: 'stock', label: 'Current Stock', sortable: true, render: (r) => {
      const s = stockStatus(r.stock, r.minStock);
      return <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold ${s === 'ok' ? 'bg-[#e7f7ee] text-[#1c8a4b]' : s === 'low' ? 'bg-[#fff4e0] text-[#b3760a]' : 'bg-[#fde8e8] text-[#c22b2b]'}`}>{r.stock ?? 0}</span>;
    } },
    { key: 'minStock', label: 'Minimum Stock' },
    { key: 'adjust', label: 'Quick Adjust', render: (r) => (
      <div className="flex gap-1.5">
        <button type="button" onClick={() => quickAdjust(r, -1)} className="h-7 w-7 rounded-sm border border-border bg-white font-bold hover:border-brand-magenta hover:text-brand-magenta">−</button>
        <button type="button" onClick={() => quickAdjust(r, 1)} className="h-7 w-7 rounded-sm border border-border bg-white font-bold hover:border-brand-magenta hover:text-brand-magenta">+</button>
      </div>
    ) },
    { key: 'history', label: 'History', render: (r) => <button type="button" onClick={() => setHistoryRow(r)} className="text-brand-magenta text-xs font-semibold hover:underline">View</button> },
  ];

  const quickAdjust = async (row, delta) => {
    try {
      await inventoryApi.adjust(row._id || row.id, { delta, reason: delta > 0 ? 'restock' : 'correction' });
    } catch { /* backend not connected in this environment */ }
    await entity.update(row._id || row.id, { stock: Math.max(0, (row.stock || 0) + delta) });
    toast.success('Stock updated');
  };

  const submitAdjust = async () => {
    if (!adjustRow) return;
    const newStock = Math.max(0, (adjustRow.stock || 0) + Number(adjustQty));
    try { await inventoryApi.adjust(adjustRow._id || adjustRow.id, { delta: Number(adjustQty), reason: adjustReason }); } catch {}
    await entity.update(adjustRow._id || adjustRow.id, { stock: newStock });
    toast.success('Stock adjusted');
    setAdjustRow(null);
    setAdjustQty(0);
  };

  return (
    <div>
      <StatGrid>
        <MiniStat label="Total SKUs" value={counts.total} />
        <MiniStat label="Low Stock" value={counts.low} tone="warn" />
        <MiniStat label="Out of Stock" value={counts.out} tone="danger" />
      </StatGrid>

      <Tabs tabs={TABS.map((t) => ({ ...t, count: t.value === 'all' ? counts.total : counts[t.value] }))} active={tab} onChange={setTab} />

      <EntityListPage
        title="Inventory"
        subtitle="Track stock levels, run adjustments, and monitor low/out-of-stock products."
        entity={scopedEntity}
        columns={columns}
        exportFilename="inventory"
        extraActions={<Button variant="secondary" onClick={() => setAdjustRow(entity.allRows[0] || null)} disabled={!entity.allRows.length}>Stock Adjustment</Button>}
      />

      <Modal open={!!adjustRow} onClose={() => setAdjustRow(null)} title="Stock Adjustment" footer={<>
        <Button variant="secondary" onClick={() => setAdjustRow(null)}>Cancel</Button>
        <Button onClick={submitAdjust}>Apply Adjustment</Button>
      </>}>
        {adjustRow && (
          <div className="flex flex-col gap-4">
            <FormField label="Product">
              <Select value={adjustRow._id || adjustRow.id} onChange={(e) => setAdjustRow(entity.allRows.find((r) => (r._id || r.id) === e.target.value))}>
                {entity.allRows.map((r) => <option key={r._id || r.id} value={r._id || r.id}>{r.name} (current: {r.stock ?? 0})</option>)}
              </Select>
            </FormField>
            <FormField label="Adjustment Quantity" hint="Use a negative number to reduce stock">
              <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.valueAsNumber || 0)} />
            </FormField>
            <FormField label="Reason">
              <Select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}>
                <option value="restock">Restock</option>
                <option value="correction">Stock Correction</option>
                <option value="damaged">Damaged / Lost</option>
                <option value="return">Customer Return</option>
              </Select>
            </FormField>
          </div>
        )}
      </Modal>

      <Drawer open={!!historyRow} onClose={() => setHistoryRow(null)} title={historyRow ? `Stock History — ${historyRow.name}` : 'Stock History'}>
        <EmptyState title="No stock movements recorded yet" hint="Adjustments made from this panel will appear here once the inventory endpoint is connected." />
      </Drawer>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="bg-surface border border-border-soft rounded-lg p-4 shadow-sm">
      <p className="text-[12px] text-ink-muted font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${tone === 'warn' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{value}</p>
    </div>
  );
}
