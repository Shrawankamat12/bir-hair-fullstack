import { useEffect, useRef, useState } from 'react';
import mediaApi from '../../api/media.api.js';
import { PageHeader, Button, Input, Card } from '../../components/ui/index.js';
import { PageLoader, EmptyState, useToast, Spinner } from '../../components/ui/Feedback.jsx';

const FOLDERS = ['All', 'Products', 'Categories', 'Banners', 'Blog', 'Brands'];

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState('All');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [zoomed, setZoomed] = useState(null);
  const inputRef = useRef(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    mediaApi.list().then((data) => setItems(Array.isArray(data) ? data : data?.items || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) await mediaApi.upload(file, folder === 'All' ? 'general' : folder.toLowerCase());
      toast.success('Uploaded');
      load();
    } catch {
      toast.error('Media endpoint is not connected yet — files were not persisted.');
    } finally { setUploading(false); }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this file?')) return;
    try { await mediaApi.remove(item._id || item.id); } catch {}
    setItems((prev) => prev.filter((i) => i !== item));
  };

  const filtered = items.filter((i) => (folder === 'All' || i.folder === folder.toLowerCase()) && (!query || (i.name || '').toLowerCase().includes(query.toLowerCase())));

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle="Central place for every uploaded image across the store."
        actions={<Button onClick={() => inputRef.current?.click()} loading={uploading}>+ Upload Files</Button>}
      />
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {FOLDERS.map((f) => (
          <button key={f} onClick={() => setFolder(f)} className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors ${folder === f ? 'bg-brand-gradient text-white border-transparent' : 'bg-white border-border text-ink-muted hover:border-brand-magenta hover:text-brand-magenta'}`}>{f}</button>
        ))}
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" className="max-w-[220px] ml-auto" />
      </div>

      <Card>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
          className="border-2 border-dashed border-border rounded-md p-6 mb-5 text-center text-ink-faint text-[13px]"
        >
          Drag & drop images here, or use the "Upload Files" button above.
        </div>

        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState title="No media files" hint="Upload an image to get started, or connect the /admin/media endpoint on the backend." />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {filtered.map((item, i) => (
              <div key={item._id || item.id || i} className="relative aspect-square rounded-md overflow-hidden border border-border-soft group bg-surface-muted">
                <img src={item.url} className="h-full w-full object-cover cursor-pointer" onClick={() => setZoomed(item.url)} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => navigator.clipboard?.writeText(item.url)} className="h-7 w-7 rounded-full bg-white/90 text-xs">🔗</button>
                  <button onClick={() => remove(item)} className="h-7 w-7 rounded-full bg-white/90 text-xs text-danger">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {zoomed && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-8" onClick={() => setZoomed(null)}>
          <img src={zoomed} className="max-h-full max-w-full rounded-md shadow-2xl" />
        </div>
      )}
    </div>
  );
}
