import { useRef, useState } from 'react';
import { uploadImage } from '../../api/upload.api.js';
import { Spinner } from './Feedback.jsx';
import { resolveMediaUrl } from '../../lib/media.js';

/** Single-image uploader — used for logos, banners, category images, avatars. */
export function SingleImageUpload({ value, onChange, label = 'Image', aspect = 'aspect-square', className = '', onUploadStateChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const pick = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    onUploadStateChange?.(true);
    try {
      const res = await uploadImage(file);
      onChange(res?.url || res?.path || '');
    } catch {
      // upload endpoint not reachable in this environment — keep local preview so the form still works
      onChange(preview);
    } finally {
      setBusy(false);
      onUploadStateChange?.(false);
    }
  };

  const displaySrc = preview.startsWith('blob:') ? preview : resolveMediaUrl(preview);

  return (
    <div className={className}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative ${aspect} w-full max-w-[200px] rounded-md border-2 border-dashed border-border bg-surface-muted flex items-center justify-center cursor-pointer overflow-hidden hover:border-brand-magenta transition-colors group`}
      >
        {busy && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Spinner /></div>}
        {preview ? (
          <>
            <img src={displaySrc} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="text-white text-xs font-semibold">Change</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-ink-faint px-3 text-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <span className="text-[11.5px] font-medium">Click or drop {label.toLowerCase()}</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {preview && (
        <button type="button" onClick={() => { setPreview(''); onChange(''); }} className="mt-2 text-[11.5px] font-semibold text-danger hover:underline">Remove image</button>
      )}
    </div>
  );
}

/** Multi-image gallery uploader — products, categories, blog posts. Drag to reorder, click to set primary. */
export function GalleryUpload({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const dragIndex = useRef(null);
  const [zoomed, setZoomed] = useState(null);

  const addFiles = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    const next = [...images];
    for (const file of Array.from(files)) {
      const localUrl = URL.createObjectURL(file);
      try {
        const res = await uploadImage(file);
        next.push({ url: res?.url || res?.path || localUrl, isPrimary: next.length === 0 });
      } catch {
        next.push({ url: localUrl, isPrimary: next.length === 0 });
      }
    }
    onChange(next);
    setBusy(false);
  };

  const remove = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    if (next.length && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  };

  const setPrimary = (idx) => onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));

  const onDrop = (idx) => {
    const from = dragIndex.current;
    if (from === null || from === idx) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    dragIndex.current = null;
  };

  // blob: URLs (fresh local previews before upload finishes) must be used
  // as-is; everything else (relative /uploads/... paths, or absolute URLs)
  // goes through resolveMediaUrl.
  const displayUrl = (url) => (url?.startsWith('blob:') ? url : resolveMediaUrl(url));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => (dragIndex.current = idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(idx)}
            className="relative h-24 w-24 rounded-md overflow-hidden border border-border group cursor-grab bg-surface-muted"
          >
            <img src={displayUrl(img.url)} alt="" className="h-full w-full object-cover" onClick={() => setZoomed(img.url)} />
            {img.isPrimary && <span className="absolute top-1 left-1 bg-brand-gradient text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRIMARY</span>}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!img.isPrimary && (
                <button type="button" title="Set primary" onClick={() => setPrimary(idx)} className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-brand-magenta text-xs">★</button>
              )}
              <button type="button" title="Remove" onClick={() => remove(idx)} className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center text-danger text-xs">✕</button>
            </div>
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          className="h-24 w-24 rounded-md border-2 border-dashed border-border bg-surface-muted flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-magenta transition-colors text-ink-faint"
        >
          {busy ? <Spinner /> : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              <span className="text-[10.5px] font-semibold">Add images</span>
            </>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      <p className="text-[11px] text-ink-faint mt-2">Drag thumbnails to reorder · click the star to set the primary/cover image</p>

      {zoomed && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex items-center justify-center p-8" onClick={() => setZoomed(null)}>
          <img src={displayUrl(zoomed)} alt="" className="max-h-full max-w-full rounded-md shadow-2xl" />
        </div>
      )}
    </div>
  );
}

/** Simple video URL / upload field (hosted video is usually a URL, not a raw file, for admin panels). */
export function VideoField({ value, onChange }) {
  return (
    <input
      type="url"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://... (YouTube, Vimeo, or hosted MP4 URL)"
      className="w-full px-3.5 py-2.5 rounded-sm border border-border bg-surface-muted text-[14px] outline-none focus:border-brand-magenta focus:bg-white focus:shadow-[0_0_0_3px_rgba(168,59,171,0.12)]"
    />
  );
}