import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader, Card, Button, FormField, Input, Textarea, Switch, Badge, EmptyState, PageLoader, ConfirmDialog, useToast,
} from '../../components/ui/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getHeroSlider, saveHeroSlider, initHeroSlider } from '../../api/heroSlider.api.js';
import { resolveMediaUrl } from '../../lib/media.js';
import { ImageItem, VideoItem, InstagramItem } from './HeroMediaFields.jsx';
import { SLIDE_META, MAX_MEDIA, LIMITS, blankMedia, toDraft, toPayload, validateDraft } from './heroUtils.js';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || '/';

const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function TextFields({ slide, si, errs, onChange }) {
  const p = `slides[${si}]`;
  const id = (n) => `hero-${si}-${n}`;
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Heading" htmlFor={id('title')} className="col-span-2" error={errs[`${p}.title`]}>
        <Input id={id('title')} value={slide.title || ''} onChange={(e) => onChange({ title: e.target.value })} error={!!errs[`${p}.title`]} />
      </FormField>
      <FormField label="Description" htmlFor={id('desc')} className="col-span-2" error={errs[`${p}.description`]}>
        <Textarea id={id('desc')} rows={3} value={slide.description || ''} onChange={(e) => onChange({ description: e.target.value })} error={!!errs[`${p}.description`]} />
      </FormField>
      <FormField label="Button label" htmlFor={id('cta-label')} error={errs[`${p}.ctaLabel`]} hint="Optional — leave both button fields empty for no button">
        <Input id={id('cta-label')} value={slide.ctaLabel || ''} onChange={(e) => onChange({ ctaLabel: e.target.value })} placeholder="Shop the Collection" error={!!errs[`${p}.ctaLabel`]} />
      </FormField>
      <FormField label="Button link" htmlFor={id('cta-url')} error={errs[`${p}.ctaUrl`]} hint="A page like /shop, or a full https:// link">
        <Input id={id('cta-url')} value={slide.ctaUrl || ''} onChange={(e) => onChange({ ctaUrl: e.target.value })} placeholder="/shop" error={!!errs[`${p}.ctaUrl`]} />
      </FormField>
    </div>
  );
}

function SlideBody({ slide, si, errs, patch, setMedia, addMedia, removeMedia, moveMedia }) {
  const type = slide.slideType;
  const mErr = (mi) => ({
    url: errs[`slides[${si}].media[${mi}].url`],
    thumbnail: errs[`slides[${si}].media[${mi}].thumbnail`],
  });

  if (type === 'existing-hero') {
    return (
      <div className="rounded-lg bg-brand-gradient-soft p-4 text-[13.5px] text-ink">
        <p className="font-semibold">This is your original homepage hero — it is kept exactly as it is.</p>
        <p className="mt-1 text-ink-muted">Edit its title, image, buttons and badges in Website Content → Hero Banner. Nothing on this page can change or delete that content.</p>
        <Button as={Link} to="/site-content" variant="secondary" size="sm" className="mt-3">Open Website Content</Button>
      </div>
    );
  }

  if (type === 'image-video-image') {
    const [left, video, right] = slide.media;
    return (
      <div className="flex flex-col gap-5">
        <details className="group">
          <summary className="cursor-pointer text-[12.5px] font-semibold text-brand-magenta">Optional heading, text and button above the images</summary>
          <div className="mt-3"><TextFields slide={slide} si={si} errs={errs} onChange={patch} /></div>
        </details>
        <div className="grid gap-4 lg:grid-cols-3">
          <ImageItem heading="Left image (optional)" m={left} errs={mErr(0)} onChange={(v) => setMedia(0, v)} emptyHint="Not shown" />
          <VideoItem m={video} errs={mErr(1)} onChange={(v) => setMedia(1, v)} />
          <ImageItem heading="Right image (optional)" m={right} errs={mErr(2)} onChange={(v) => setMedia(2, v)} emptyHint="Not shown" />
        </div>
      </div>
    );
  }

  if (type === 'content-gallery') {
    const max = MAX_MEDIA[type];
    return (
      <div className="flex flex-col gap-5">
        <TextFields slide={slide} si={si} errs={errs} onChange={patch} />
        <div>
          <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Images ({slide.media.length}/{max}) — shown in this order, left to right</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slide.media.map((m, mi) => (
              <ImageItem
                key={m._k}
                heading={`Image ${mi + 1}`}
                showCaption
                m={m}
                errs={mErr(mi)}
                idx={mi}
                count={slide.media.length}
                onChange={(v) => setMedia(mi, v)}
                onMove={(d) => moveMedia(mi, d)}
                onRemove={() => removeMedia(mi)}
              />
            ))}
          </div>
          {slide.media.length < max && (
            <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => addMedia(blankMedia('image'))}>+ Add image</Button>
          )}
        </div>
      </div>
    );
  }

  // instagram-single / instagram-multi
  const max = MAX_MEDIA[type];
  return (
    <div className="flex flex-col gap-5">
      <TextFields slide={slide} si={si} errs={errs} onChange={patch} />
      <div>
        <p className="text-[12.5px] font-semibold text-ink-muted mb-2">
          {type === 'instagram-single' ? 'Reel' : `Video cards (${slide.media.length}/${max}) — shown in this order`}
        </p>
        <div className={`grid gap-4 ${type === 'instagram-multi' ? 'md:grid-cols-2 xl:grid-cols-3' : 'max-w-xl'}`}>
          {slide.media.map((m, mi) => (
            <InstagramItem
              key={m._k}
              heading={type === 'instagram-single' ? 'Instagram Reel' : `Video ${mi + 1}`}
              m={m}
              errs={mErr(mi)}
              idx={mi}
              count={slide.media.length}
              onChange={(v) => setMedia(mi, v)}
              onMove={type === 'instagram-multi' ? (d) => moveMedia(mi, d) : undefined}
              onRemove={() => removeMedia(mi)}
            />
          ))}
        </div>
        {slide.media.length < max && (
          <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => addMedia(blankMedia('instagram'))}>
            {type === 'instagram-single' ? '+ Add Reel' : '+ Add video card'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Compact summary + thumbnails: lets an admin inspect a slide without opening it.
function SlideSummary({ slide }) {
  const media = slide.media || [];
  const shown = media.filter((m) => m.enabled !== false).length;
  const thumbs = media.map((m) => (m.mediaType === 'image' ? m.url : m.thumbnail)).filter(Boolean).slice(0, 4);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex -space-x-2 shrink-0">
        {thumbs.map((t, i) => (
          <img key={i} src={resolveMediaUrl(t)} alt="" className="h-9 w-9 rounded-full object-cover border-2 border-white bg-surface-muted" />
        ))}
      </div>
      <p className="text-[12px] text-ink-faint truncate">
        {slide.slideType === 'existing-hero'
          ? 'Content managed in Website Content'
          : `${slide.title || 'No heading'} · ${shown}/${media.length} item${media.length === 1 ? '' : 's'} shown`}
      </p>
    </div>
  );
}

export default function HeroSliderManager() {
  const toast = useToast();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [configured, setConfigured] = useState(false);
  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState('');
  const [saving, setSaving] = useState(false);
  const [initing, setIniting] = useState(false);
  const [open, setOpen] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [confirmOff, setConfirmOff] = useState(false);

  const apply = useCallback((cfg) => {
    const d = toDraft(cfg);
    setConfigured(cfg.configured);
    setDraft(d);
    setBaseline(JSON.stringify(toPayload(d)));
    setServerErrors([]);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    return getHeroSlider()
      .then(apply)
      .catch((err) => setLoadError(err?.response?.data?.message || 'Could not load the hero slider.'))
      .finally(() => setLoading(false));
  }, [apply]);

  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(() => !!draft && JSON.stringify(toPayload(draft)) !== baseline, [draft, baseline]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const clientErrors = useMemo(() => (draft ? validateDraft(draft) : {}), [draft]);
  const serverMap = useMemo(() => Object.fromEntries(serverErrors.map((e) => [e.field, e.message])), [serverErrors]);
  const errs = { ...serverMap, ...clientErrors };
  const errorCount = Object.keys(clientErrors).length;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const patchSlide = (si, patch) => setDraft((d) => ({ ...d, slides: d.slides.map((s, i) => (i === si ? { ...s, ...patch } : s)) }));
  const mapMedia = (si, fn) => setDraft((d) => ({ ...d, slides: d.slides.map((s, i) => (i === si ? { ...s, media: fn(s.media) } : s)) }));

  const save = async () => {
    if (errorCount) {
      toast.error('Please fix the highlighted fields first');
      return;
    }
    setSaving(true);
    setServerErrors([]);
    try {
      const saved = await saveHeroSlider(toPayload(draft));
      apply(saved);
      toast.success('Hero slider saved — refresh the storefront to see it');
    } catch (err) {
      const data = err?.response?.data;
      setServerErrors(data?.errors || []);
      const status = err?.response?.status;
      toast.error(
        status === 403 ? 'Only administrators can change the hero slider'
          : status === 409 ? (data?.message || 'Someone else changed this — reload the page')
            : data?.message || 'Could not save the hero slider'
      );
    } finally {
      setSaving(false);
    }
  };

  const initialize = async () => {
    setIniting(true);
    try {
      apply(await initHeroSlider());
      toast.success('Default 5-slide hero created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create the default hero');
      if (err?.response?.status === 409) load();
    } finally {
      setIniting(false);
    }
  };

  if (loading) return <PageLoader label="Loading hero slider…" />;
  if (loadError) {
    return (
      <Card>
        <EmptyState title="Could not load the hero slider" hint={loadError} action={<Button size="sm" onClick={load}>Try again</Button>} />
      </Card>
    );
  }

  if (!configured) {
    return (
      <>
        <PageHeader title="Hero Slider" subtitle="Manage the five slides of the homepage hero." />
        <Card>
          <EmptyState
            title="The hero slider hasn’t been set up yet"
            hint="Your storefront is still showing your original hero banner. Create the default five-slide setup to start managing it here. Existing content is never overwritten."
            action={canEdit ? <Button onClick={initialize} loading={initing}>Create default 5-slide setup</Button> : <p className="text-xs text-ink-faint">Ask an administrator to set this up.</p>}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Hero Slider"
        subtitle="Control the five slides at the top of your homepage. Changes appear on the storefront after you save and refresh."
        actions={(
          <>
            <Button as="a" href={STOREFRONT_URL} target="_blank" rel="noopener noreferrer" variant="secondary">View storefront ↗</Button>
            {dirty && <Button variant="ghost" onClick={load}>Discard changes</Button>}
            <Button onClick={save} loading={saving} disabled={!canEdit || !dirty}>Save Changes</Button>
          </>
        )}
      />

      {!canEdit && (
        <div className="mb-4 rounded-lg border border-border-soft bg-[#fff4e0] px-4 py-3 text-[13px] text-[#8a5a08]">
          You can view the hero slider, but only administrators can change it.
        </div>
      )}
      {dirty && <div className="mb-4 rounded-lg border border-border-soft bg-brand-gradient-soft px-4 py-2.5 text-[13px] font-semibold text-brand-magenta">You have unsaved changes.</div>}
      {serverErrors.length > 0 && (
        <div role="alert" className="mb-4 rounded-lg border border-danger bg-[#fde8e8] px-4 py-3 text-[13px] text-[#a12323]">
          <p className="font-semibold mb-1">The server rejected these changes:</p>
          <ul className="list-disc pl-5">{serverErrors.map((e, i) => <li key={i}>{e.message}{e.field ? ` (${e.field})` : ''}</li>)}</ul>
        </div>
      )}
      {errs.slides && <p className="mb-4 text-[13px] font-medium text-danger">{errs.slides}</p>}

      <fieldset disabled={!canEdit} className="min-w-0 border-0 p-0 m-0 flex flex-col gap-5">
        <Card title="Hero section settings">
          <div className="grid gap-5 md:grid-cols-3 items-start">
            <div>
              <Switch
                checked={draft.enabled}
                onChange={(v) => (v ? set({ enabled: true }) : setConfirmOff(true))}
                label="Show the hero on the homepage"
              />
              <p className="mt-1.5 text-[11.5px] text-ink-faint">Turning this off hides the whole hero, including slide 1.</p>
            </div>
            <div>
              <Switch checked={draft.autoplay} onChange={(v) => set({ autoplay: v })} label="Autoplay slides" />
              <p className="mt-1.5 text-[11.5px] text-ink-faint">Pauses automatically while a visitor hovers, touches or plays a video.</p>
            </div>
            <FormField label="Seconds per slide" htmlFor="hero-interval" error={errs.autoplayInterval}>
              <Input
                id="hero-interval"
                type="number"
                min={LIMITS.minSec}
                max={LIMITS.maxSec}
                step="0.5"
                disabled={!draft.autoplay}
                value={draft.autoplayInterval / 1000}
                onChange={(e) => set({ autoplayInterval: Math.round(Number(e.target.value) * 1000) })}
                error={!!errs.autoplayInterval}
              />
            </FormField>
          </div>
        </Card>

        {draft.slides.map((slide, si) => {
          const meta = SLIDE_META[slide.slideType];
          const isOpen = !!open[slide.slideType];
          const slideHasErr = Object.keys(clientErrors).some((k) => k.startsWith(`slides[${si}]`));
          return (
            <Card key={slide.slideType} padded={false} className={slide.enabled === false ? 'opacity-70' : ''}>
              <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
                <span className="h-8 w-8 shrink-0 rounded-full bg-brand-gradient text-white text-sm font-bold flex items-center justify-center">{si + 1}</span>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [slide.slideType]: !o[slide.slideType] }))}
                  className="text-left flex-1 min-w-[220px]"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-[15px] font-semibold text-ink">{meta.label}</span>
                    <Badge tone={slide.enabled === false ? 'neutral' : 'success'}>{slide.enabled === false ? 'Hidden' : 'Live'}</Badge>
                    {slideHasErr && <Badge tone="danger">Needs attention</Badge>}
                  </div>
                  <SlideSummary slide={slide} />
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" disabled={si === 0} onClick={() => setDraft((d) => ({ ...d, slides: move(d.slides, si, -1) }))} aria-label={`Move slide ${si + 1} up`} className="text-xs text-ink-faint hover:text-ink disabled:opacity-30">↑ Up</button>
                  <button type="button" disabled={si === draft.slides.length - 1} onClick={() => setDraft((d) => ({ ...d, slides: move(d.slides, si, 1) }))} aria-label={`Move slide ${si + 1} down`} className="text-xs text-ink-faint hover:text-ink disabled:opacity-30">↓ Down</button>
                  <Switch checked={slide.enabled !== false} onChange={(v) => patchSlide(si, { enabled: v })} label="Enabled" />
                  <Button type="button" size="sm" variant="subtle" onClick={() => setOpen((o) => ({ ...o, [slide.slideType]: !o[slide.slideType] }))}>{isOpen ? 'Close' : 'Edit'}</Button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border-soft px-5 py-5">
                  <p className="text-[12.5px] text-ink-faint mb-4">{meta.help}</p>
                  <SlideBody
                    slide={slide}
                    si={si}
                    errs={errs}
                    patch={(p) => patchSlide(si, p)}
                    setMedia={(mi, p) => mapMedia(si, (m) => m.map((x, i) => (i === mi ? { ...x, ...p } : x)))}
                    addMedia={(item) => mapMedia(si, (m) => [...m, item])}
                    removeMedia={(mi) => mapMedia(si, (m) => m.filter((_, i) => i !== mi))}
                    moveMedia={(mi, d) => mapMedia(si, (m) => move(m, mi, d))}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </fieldset>

      <ConfirmDialog
        open={confirmOff}
        title="Hide the whole hero?"
        message="Visitors will see no hero at the top of the homepage — including your original slide 1 — until you turn this back on and save. Your content is not deleted."
        confirmLabel="Hide hero"
        onCancel={() => setConfirmOff(false)}
        onConfirm={() => { set({ enabled: false }); setConfirmOff(false); }}
      />
    </>
  );
}