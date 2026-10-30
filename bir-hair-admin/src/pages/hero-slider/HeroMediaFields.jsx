import { useRef, useState } from 'react';
import { Input, Switch, Spinner, useToast } from '../../components/ui/index.js';
import { uploadImage } from '../../api/upload.api.js';
import { resolveMediaUrl } from '../../lib/media.js';
import { isInstagramUrl } from './heroUtils.js';

const label = 'block text-[12px] font-semibold text-ink-muted mb-1';

function Err({ msg }) {
  return msg ? <p className="mt-1 text-[11.5px] text-danger font-medium">{msg}</p> : null;
}

/** Image = preview + upload + URL box. Upload failures are reported (never silently stored). */
export function ImageInput({ value, onChange, title = 'Image', error, aspect = 'aspect-[4/5]', emptyHint = 'Storefront default' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadImage(file);
      const url = res?.url || res?.path;
      if (!url) throw new Error('No URL returned');
      onChange(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Image upload failed (use JPG, PNG or WebP under 5 MB)');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div>
      <span className={label}>{title}</span>
      <div className="flex gap-3 items-start">
        <div className={`relative ${aspect} w-[72px] shrink-0 rounded-md border border-border-soft bg-surface-muted overflow-hidden flex items-center justify-center`}>
          {value ? (
            <img src={resolveMediaUrl(value)} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0.15; }} />
          ) : (
            <span className="text-[9.5px] text-ink-faint text-center px-1 leading-tight">{emptyHint}</span>
          )}
          {busy && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Spinner className="h-4 w-4" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" error={!!error} aria-label={`${title} URL`} />
          <div className="mt-1.5 flex gap-3 items-center">
            <button type="button" onClick={() => ref.current?.click()} className="text-[12px] font-semibold text-brand-magenta hover:underline">Upload</button>
            {value && <button type="button" onClick={() => onChange('')} className="text-[12px] font-semibold text-danger hover:underline">Remove</button>}
          </div>
          <Err msg={error} />
        </div>
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

function MoveBar({ idx, count, onMove, onRemove, removeLabel = 'Remove' }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {onMove && (
        <>
          <button type="button" disabled={idx === 0} onClick={() => onMove(-1)} className="text-ink-faint hover:text-ink disabled:opacity-30">↑ Up</button>
          <button type="button" disabled={idx === count - 1} onClick={() => onMove(1)} className="text-ink-faint hover:text-ink disabled:opacity-30">↓ Down</button>
        </>
      )}
      {onRemove && <button type="button" onClick={onRemove} className="text-danger font-semibold ml-auto">{removeLabel}</button>}
    </div>
  );
}

/** Image item (slide 2 left/right slot, slide 3 gallery). */
export function ImageItem({ heading, m, errs = {}, onChange, idx, count, onMove, onRemove }) {
  return (
    <div className="border border-border-soft rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{heading}</span>
        <Switch checked={m.enabled !== false} onChange={(v) => onChange({ enabled: v })} label={m.enabled !== false ? 'Shown' : 'Hidden'} />
      </div>
      <ImageInput value={m.url} onChange={(url) => onChange({ url })} title="Image" error={errs.url} />
      <div>
        <span className={label}>Alt text (describes the image for screen readers)</span>
        <Input value={m.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} placeholder="e.g. Straight natural human hair bundle" />
      </div>
      {(onMove || onRemove) && <MoveBar idx={idx} count={count} onMove={onMove} onRemove={onRemove} />}
    </div>
  );
}

/** Center video slot (slide 2). */
export function VideoItem({ m, errs = {}, onChange }) {
  return (
    <div className="border border-border-soft rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">Center video</span>
        <Switch checked={m.enabled !== false} onChange={(v) => onChange({ enabled: v })} label={m.enabled !== false ? 'Shown' : 'Hidden'} />
      </div>
      <div>
        <span className={label}>Video link</span>
        <Input type="url" value={m.url || ''} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://… (hosted MP4, YouTube or Vimeo link)" error={!!errs.url} />
        <p className="mt-1 text-[11.5px] text-ink-faint">The video plays when a visitor presses the play button. Leave empty to show only the cover image.</p>
        <Err msg={errs.url} />
      </div>
      <ImageInput value={m.thumbnail} onChange={(thumbnail) => onChange({ thumbnail })} title="Cover image (poster)" error={errs.thumbnail} />
      <div>
        <span className={label}>Alt text</span>
        <Input value={m.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Describes the video" />
      </div>
    </div>
  );
}

/** Instagram card item (slides 4 and 5). */
export function InstagramItem({ heading, m, errs = {}, onChange, idx, count, onMove, onRemove }) {
  const url = (m.url || '').trim();
  const valid = url && isInstagramUrl(url);
  return (
    <div className="border border-border-soft rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{heading}</span>
        <Switch checked={m.enabled !== false} onChange={(v) => onChange({ enabled: v })} label={m.enabled !== false ? 'Active' : 'Inactive'} />
      </div>
      <div>
        <span className={label}>Instagram Reel / post URL</span>
        <Input type="url" value={m.url || ''} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://www.instagram.com/reel/…" error={!!errs.url} />
        {valid && !errs.url && <p className="mt-1 text-[11.5px] text-success font-medium">✓ Valid Instagram link — kept exactly as entered</p>}
        <Err msg={errs.url} />
      </div>
      <ImageInput value={m.thumbnail} onChange={(thumbnail) => onChange({ thumbnail })} title="Thumbnail" aspect="aspect-[9/16]" error={errs.thumbnail} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className={label}>Card title</span>
          <Input value={m.title || ''} onChange={(e) => onChange({ title: e.target.value })} placeholder="Shown on the card" />
        </div>
        <div>
          <span className={label}>Alt text</span>
          <Input value={m.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Describes the video" />
        </div>
      </div>
      {(onMove || onRemove) && <MoveBar idx={idx} count={count} onMove={onMove} onRemove={onRemove} removeLabel="Remove card" />}
    </div>
  );
}