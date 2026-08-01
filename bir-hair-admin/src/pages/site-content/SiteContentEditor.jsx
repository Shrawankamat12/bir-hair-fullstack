import { useEffect, useState } from 'react';
import { getSiteContent, updateSiteContent } from '../../api/siteContent.api.js';
import { PageHeader, Card, Tabs, Button, FormField, Input, Textarea, Switch, TagInput } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';

const TABS = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'sections', label: 'Home Sections' },
  { value: 'why', label: 'Why Choose Us' },
  { value: 'process', label: 'Process Steps' },
  { value: 'gallery', label: 'Factory Gallery' },
  { value: 'trust', label: 'Certifications & Countries' },
  { value: 'beforeafter', label: 'Before / After' },
  { value: 'social', label: 'Instagram & Videos' },
  { value: 'coupon', label: 'Coupon Banner' },
  { value: 'faq', label: 'FAQ / Newsletter Teasers' },
  { value: 'footer', label: 'Footer' },
  { value: 'header', label: 'Header' },
];

// Deep-merge fetched data over sensible empty shapes so every nested field is controlled input-safe
const empty = {
  hero: { eyebrow: '', title: '', highlightText: '', subtitle: '', image: '', primaryCtaText: '', primaryCtaLink: '', secondaryCtaText: '', secondaryCtaLink: '', badges: [], stats: [], ratingValue: 4.9, ratingLabel: '' },
  whyChooseUs: { eyebrow: '', title: '', items: [] },
  processSteps: [],
  factoryGallery: { eyebrow: '', title: '', images: [] },
  certifications: [],
  exportCountries: [],
  beforeAfter: [],
  instagram: { handle: '', images: [] },
  videoReviews: [],
  couponBanner: { enabled: true, eyebrow: '', code: '', title: '', discountText: '', ctaText: '', ctaLink: '' },
  faqTeaser: { eyebrow: '', title: '', description: '', ctaText: '' },
  newsletterSection: { eyebrow: '', title: '', description: '' },
  homeSections: [],
  footer: { brandDescription: '', address: '', phone: '', email: '', socialLinks: { instagram: '', facebook: '', whatsapp: '', youtube: '', twitter: '' }, columns: [], trustBadges: [], bottomText: '' },
  header: { announcementEnabled: false, announcementText: '', announcementLink: '' },
};

const HOME_SECTION_LABELS = {
  categories: 'Categories', featuredCategories: 'Featured Categories', bestSellers: 'Best Sellers',
  flashSale: 'Flash Sale', newArrivals: 'New Arrivals', trending: 'Trending Products',
  premium: 'Premium Products', featuredProducts: 'Featured Products', collections: 'Collections',
  testimonials: 'Testimonials',
};

export default function SiteContentEditor() {
  const [tab, setTab] = useState('hero');
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getSiteContent()
      .then((data) => setValues((prev) => deepMerge(prev, data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (path, v) => setValues((s) => setPath(s, path, v));

  const save = async () => {
    setSaving(true);
    try { await updateSiteContent(values); toast.success('Website content saved — changes are live on the storefront'); }
    catch { toast.error('Could not reach the site-content endpoint — changes were not persisted.'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading website content…" />;

  return (
    <>
      <PageHeader
        title="Website Content"
        subtitle="Every dynamic section of the Home page, Footer and Header — edits go live on the storefront immediately."
        actions={<Button onClick={save} loading={saving}>Save Changes</Button>}
      />

      <Card padded={false}>
        <div className="px-5 pt-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="px-5 pb-6">

          {tab === 'hero' && (
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              <FormField label="Eyebrow" className="col-span-2">
                <Input value={values.hero.eyebrow} onChange={(e) => set('hero.eyebrow', e.target.value)} />
              </FormField>
              <FormField label="Title">
                <Input value={values.hero.title} onChange={(e) => set('hero.title', e.target.value)} />
              </FormField>
              <FormField label="Highlighted Title Text">
                <Input value={values.hero.highlightText} onChange={(e) => set('hero.highlightText', e.target.value)} />
              </FormField>
              <FormField label="Subtitle" className="col-span-2">
                <Textarea rows={3} value={values.hero.subtitle} onChange={(e) => set('hero.subtitle', e.target.value)} />
              </FormField>
              <FormField label="Hero Image">
                <SingleImageUpload value={values.hero.image} onChange={(v) => set('hero.image', v)} label="Hero Image" aspect="aspect-[3/4]" />
              </FormField>
              <div className="grid grid-cols-2 gap-4 content-start">
                <FormField label="Primary Button Text"><Input value={values.hero.primaryCtaText} onChange={(e) => set('hero.primaryCtaText', e.target.value)} /></FormField>
                <FormField label="Primary Button Link"><Input value={values.hero.primaryCtaLink} onChange={(e) => set('hero.primaryCtaLink', e.target.value)} /></FormField>
                <FormField label="Secondary Button Text"><Input value={values.hero.secondaryCtaText} onChange={(e) => set('hero.secondaryCtaText', e.target.value)} /></FormField>
                <FormField label="Secondary Button Link"><Input value={values.hero.secondaryCtaLink} onChange={(e) => set('hero.secondaryCtaLink', e.target.value)} /></FormField>
              </div>
              <FormField label="Trust Badges" className="col-span-2" hint="Small pills shown under the hero copy">
                <TagInput value={values.hero.badges} onChange={(v) => set('hero.badges', v)} placeholder="e.g. 100% Human Hair" />
              </FormField>
              <FormField label="Rating Value" className="col-span-1">
                <Input type="number" step="0.1" min="0" max="5" value={values.hero.ratingValue} onChange={(e) => set('hero.ratingValue', Number(e.target.value))} />
              </FormField>
              <FormField label="Rating Caption" className="col-span-1">
                <Input value={values.hero.ratingLabel} onChange={(e) => set('hero.ratingLabel', e.target.value)} placeholder="4.9 from 3,200+ buyers" />
              </FormField>
              <div className="col-span-2">
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Hero Stats</p>
                <Repeater
                  items={values.hero.stats}
                  onChange={(v) => set('hero.stats', v)}
                  newItem={() => ({ value: '', label: '' })}
                  render={(item, onItemChange) => (
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <Input value={item.value} placeholder="2014" onChange={(e) => onItemChange({ ...item, value: e.target.value })} />
                      <Input value={item.label} placeholder="Established" onChange={(e) => onItemChange({ ...item, label: e.target.value })} />
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="max-w-2xl">
              <p className="text-[12.5px] text-ink-faint mb-4">Toggle which shelves appear on the Home page. Products feed each shelf automatically based on their flags in Product → Visibility &amp; Flags.</p>
              <div className="flex flex-col gap-1">
                {values.homeSections.map((s, idx) => (
                  <div key={s.key} className="flex items-center justify-between py-2.5 border-b border-border-soft last:border-0">
                    <span className="text-[13.5px] font-medium text-ink">{HOME_SECTION_LABELS[s.key] || s.key}</span>
                    <Switch checked={s.enabled} onChange={(v) => {
                      const next = [...values.homeSections];
                      next[idx] = { ...s, enabled: v };
                      set('homeSections', next);
                    }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'why' && (
            <div className="max-w-3xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Eyebrow"><Input value={values.whyChooseUs.eyebrow} onChange={(e) => set('whyChooseUs.eyebrow', e.target.value)} /></FormField>
                <FormField label="Title"><Input value={values.whyChooseUs.title} onChange={(e) => set('whyChooseUs.title', e.target.value)} /></FormField>
              </div>
              <Repeater
                items={values.whyChooseUs.items}
                onChange={(v) => set('whyChooseUs.items', v)}
                newItem={() => ({ title: '', description: '' })}
                render={(item, onItemChange) => (
                  <div className="flex flex-col gap-2 flex-1">
                    <Input value={item.title} placeholder="Card title" onChange={(e) => onItemChange({ ...item, title: e.target.value })} />
                    <Textarea rows={2} value={item.description} placeholder="Card description" onChange={(e) => onItemChange({ ...item, description: e.target.value })} />
                  </div>
                )}
              />
            </div>
          )}

          {tab === 'process' && (
            <div className="max-w-3xl">
              <Repeater
                items={values.processSteps}
                onChange={(v) => set('processSteps', v)}
                newItem={() => ({ step: '', desc: '' })}
                render={(item, onItemChange) => (
                  <div className="flex flex-col gap-2 flex-1">
                    <Input value={item.step} placeholder="Step name, e.g. Sourcing" onChange={(e) => onItemChange({ ...item, step: e.target.value })} />
                    <Textarea rows={2} value={item.desc} placeholder="Step description" onChange={(e) => onItemChange({ ...item, desc: e.target.value })} />
                  </div>
                )}
              />
            </div>
          )}

          {tab === 'gallery' && (
            <div className="max-w-3xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Eyebrow"><Input value={values.factoryGallery.eyebrow} onChange={(e) => set('factoryGallery.eyebrow', e.target.value)} /></FormField>
                <FormField label="Title"><Input value={values.factoryGallery.title} onChange={(e) => set('factoryGallery.title', e.target.value)} /></FormField>
              </div>
              <Repeater
                items={values.factoryGallery.images}
                onChange={(v) => set('factoryGallery.images', v)}
                newItem={() => ({ label: '', image: '' })}
                render={(item, onItemChange) => (
                  <div className="flex gap-3 flex-1 items-start">
                    <SingleImageUpload value={item.image} onChange={(v) => onItemChange({ ...item, image: v })} label="Photo" aspect="aspect-square" className="w-28 shrink-0" />
                    <Input value={item.label} placeholder="Sorting Floor" onChange={(e) => onItemChange({ ...item, label: e.target.value })} />
                  </div>
                )}
              />
            </div>
          )}

          {tab === 'trust' && (
            <div className="max-w-2xl flex flex-col gap-6">
              <FormField label="Certification Pills">
                <TagInput value={values.certifications} onChange={(v) => set('certifications', v)} placeholder="e.g. ISO 9001:2015 Certified Facility" />
              </FormField>
              <FormField label="Export Countries">
                <TagInput value={values.exportCountries} onChange={(v) => set('exportCountries', v)} placeholder="e.g. USA" />
              </FormField>
            </div>
          )}

          {tab === 'beforeafter' && (
            <div className="max-w-3xl">
              <Repeater
                items={values.beforeAfter}
                onChange={(v) => set('beforeAfter', v)}
                newItem={() => ({ title: '', tag: '', beforeImage: '', afterImage: '' })}
                render={(item, onItemChange) => (
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={item.title} placeholder="Title" onChange={(e) => onItemChange({ ...item, title: e.target.value })} />
                      <Input value={item.tag} placeholder="Tag, e.g. 18&quot; Body Wave" onChange={(e) => onItemChange({ ...item, tag: e.target.value })} />
                    </div>
                    <div className="flex gap-3">
                      <SingleImageUpload value={item.beforeImage} onChange={(v) => onItemChange({ ...item, beforeImage: v })} label="Before" aspect="aspect-square" className="w-28 shrink-0" />
                      <SingleImageUpload value={item.afterImage} onChange={(v) => onItemChange({ ...item, afterImage: v })} label="After" aspect="aspect-square" className="w-28 shrink-0" />
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {tab === 'social' && (
            <div className="max-w-3xl flex flex-col gap-6">
              <FormField label="Instagram Handle" className="max-w-xs">
                <Input value={values.instagram.handle} onChange={(e) => set('instagram.handle', e.target.value)} placeholder="@yourhandle" />
              </FormField>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Instagram Grid Images</p>
                <ImageListRepeater items={values.instagram.images} onChange={(v) => set('instagram.images', v)} />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Video Review Thumbnails</p>
                <ImageListRepeater items={values.videoReviews} onChange={(v) => set('videoReviews', v)} />
              </div>
            </div>
          )}

          {tab === 'coupon' && (
            <div className="max-w-2xl flex flex-col gap-4">
              <Switch checked={values.couponBanner.enabled} onChange={(v) => set('couponBanner.enabled', v)} label="Show coupon banner on Home page" />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Eyebrow"><Input value={values.couponBanner.eyebrow} onChange={(e) => set('couponBanner.eyebrow', e.target.value)} /></FormField>
                <FormField label="Coupon Code"><Input value={values.couponBanner.code} onChange={(e) => set('couponBanner.code', e.target.value)} /></FormField>
                <FormField label="Discount Text" hint='e.g. "10%"'><Input value={values.couponBanner.discountText} onChange={(e) => set('couponBanner.discountText', e.target.value)} /></FormField>
                <FormField label="Title Suffix" hint='e.g. "off your first bulk order"'><Input value={values.couponBanner.title} onChange={(e) => set('couponBanner.title', e.target.value)} /></FormField>
                <FormField label="Button Text"><Input value={values.couponBanner.ctaText} onChange={(e) => set('couponBanner.ctaText', e.target.value)} /></FormField>
                <FormField label="Button Link"><Input value={values.couponBanner.ctaLink} onChange={(e) => set('couponBanner.ctaLink', e.target.value)} /></FormField>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="max-w-2xl flex flex-col gap-6">
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">FAQ Teaser</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Eyebrow"><Input value={values.faqTeaser.eyebrow} onChange={(e) => set('faqTeaser.eyebrow', e.target.value)} /></FormField>
                  <FormField label="Title"><Input value={values.faqTeaser.title} onChange={(e) => set('faqTeaser.title', e.target.value)} /></FormField>
                  <FormField label="Description" className="col-span-2"><Textarea rows={2} value={values.faqTeaser.description} onChange={(e) => set('faqTeaser.description', e.target.value)} /></FormField>
                  <FormField label="Button Text"><Input value={values.faqTeaser.ctaText} onChange={(e) => set('faqTeaser.ctaText', e.target.value)} /></FormField>
                </div>
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Newsletter Section</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Eyebrow"><Input value={values.newsletterSection.eyebrow} onChange={(e) => set('newsletterSection.eyebrow', e.target.value)} /></FormField>
                  <FormField label="Title"><Input value={values.newsletterSection.title} onChange={(e) => set('newsletterSection.title', e.target.value)} /></FormField>
                  <FormField label="Description" className="col-span-2"><Textarea rows={2} value={values.newsletterSection.description} onChange={(e) => set('newsletterSection.description', e.target.value)} /></FormField>
                </div>
              </div>
            </div>
          )}

          {tab === 'footer' && (
            <div className="max-w-3xl flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Brand Description" className="col-span-2"><Textarea rows={3} value={values.footer.brandDescription} onChange={(e) => set('footer.brandDescription', e.target.value)} /></FormField>
                <FormField label="Address"><Input value={values.footer.address} onChange={(e) => set('footer.address', e.target.value)} /></FormField>
                <FormField label="Phone"><Input value={values.footer.phone} onChange={(e) => set('footer.phone', e.target.value)} /></FormField>
                <FormField label="Email"><Input value={values.footer.email} onChange={(e) => set('footer.email', e.target.value)} /></FormField>
                <FormField label="Bottom Bar Text"><Input value={values.footer.bottomText} onChange={(e) => set('footer.bottomText', e.target.value)} /></FormField>
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Social Links</p>
                <div className="grid grid-cols-2 gap-4">
                  {['instagram', 'facebook', 'whatsapp', 'youtube', 'twitter'].map((k) => (
                    <FormField key={k} label={k[0].toUpperCase() + k.slice(1)}>
                      <Input value={values.footer.socialLinks[k]} onChange={(e) => set(`footer.socialLinks.${k}`, e.target.value)} placeholder="https://…" />
                    </FormField>
                  ))}
                </div>
              </div>
              <FormField label="Trust Badges (footer strip)">
                <TagInput value={values.footer.trustBadges} onChange={(v) => set('footer.trustBadges', v)} />
              </FormField>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-muted mb-2">Footer Columns</p>
                <FooterColumnsEditor columns={values.footer.columns} onChange={(v) => set('footer.columns', v)} />
              </div>
            </div>
          )}

          {tab === 'header' && (
            <div className="max-w-2xl flex flex-col gap-4">
              <Switch checked={values.header.announcementEnabled} onChange={(v) => set('header.announcementEnabled', v)} label="Show announcement bar above the header" />
              <FormField label="Announcement Text"><Input value={values.header.announcementText} onChange={(e) => set('header.announcementText', e.target.value)} placeholder="Free shipping on orders over ₹15,000" /></FormField>
              <FormField label="Announcement Link (optional)"><Input value={values.header.announcementLink} onChange={(e) => set('header.announcementLink', e.target.value)} placeholder="/shop" /></FormField>
            </div>
          )}

        </div>
      </Card>
    </>
  );
}

/** Generic add/remove list editor used for stats, why-us cards, process steps, gallery photos, before/after pairs. */
function Repeater({ items = [], onChange, newItem, render }) {
  const update = (idx, val) => { const next = [...items]; next[idx] = val; onChange(next); };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, newItem()]);
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 p-3 rounded-md border border-border-soft bg-surface-muted">
          {render(item, (val) => update(idx, val))}
          <button type="button" onClick={() => remove(idx)} className="text-danger text-xs font-semibold shrink-0 mt-1">Remove</button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={add} className="self-start">+ Add</Button>
    </div>
  );
}

/** Simple list of image URLs (Instagram grid, video thumbnails) — smaller footprint than the full Repeater. */
function ImageListRepeater({ items = [], onChange }) {
  const update = (idx, val) => { const next = [...items]; next[idx] = val; onChange(next); };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((img, idx) => (
        <div key={idx} className="relative">
          <SingleImageUpload value={img} onChange={(v) => update(idx, v)} label="Image" aspect="aspect-square" className="w-24" />
          <button type="button" onClick={() => remove(idx)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-danger text-white text-xs leading-5 text-center">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="w-24 aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center text-ink-faint text-xs font-semibold hover:border-brand-magenta hover:text-brand-magenta transition-colors">+ Add</button>
    </div>
  );
}

function FooterColumnsEditor({ columns = [], onChange }) {
  const updateCol = (idx, val) => { const next = [...columns]; next[idx] = val; onChange(next); };
  const removeCol = (idx) => onChange(columns.filter((_, i) => i !== idx));
  const addCol = () => onChange([...columns, { title: '', links: [] }]);

  const updateLink = (ci, li, val) => {
    const next = [...columns];
    const links = [...next[ci].links];
    links[li] = val;
    next[ci] = { ...next[ci], links };
    onChange(next);
  };
  const removeLink = (ci, li) => {
    const next = [...columns];
    next[ci] = { ...next[ci], links: next[ci].links.filter((_, i) => i !== li) };
    onChange(next);
  };
  const addLink = (ci) => {
    const next = [...columns];
    next[ci] = { ...next[ci], links: [...next[ci].links, { label: '', url: '' }] };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {columns.map((col, ci) => (
        <div key={ci} className="p-3 rounded-md border border-border-soft bg-surface-muted flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Input value={col.title} placeholder="Column title, e.g. Shop" onChange={(e) => updateCol(ci, { ...col, title: e.target.value })} className="max-w-xs" />
            <button type="button" onClick={() => removeCol(ci)} className="text-danger text-xs font-semibold">Remove Column</button>
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {col.links.map((link, li) => (
              <div key={li} className="flex items-center gap-2">
                <Input value={link.label} placeholder="Label" onChange={(e) => updateLink(ci, li, { ...link, label: e.target.value })} className="max-w-[180px]" />
                <Input value={link.url} placeholder="/shop" onChange={(e) => updateLink(ci, li, { ...link, url: e.target.value })} />
                <button type="button" onClick={() => removeLink(ci, li)} className="text-danger text-xs font-semibold shrink-0">×</button>
              </div>
            ))}
            <Button type="button" variant="subtle" size="sm" onClick={() => addLink(ci)} className="self-start">+ Add Link</Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addCol} className="self-start">+ Add Column</Button>
    </div>
  );
}

// --- small helpers ---
function setPath(obj, path, value) {
  const keys = path.split('.');
  const next = { ...obj };
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor[keys[i]] = Array.isArray(cursor[keys[i]]) ? [...cursor[keys[i]]] : { ...cursor[keys[i]] };
    cursor = cursor[keys[i]];
  }
  cursor[keys[keys.length - 1]] = value;
  return next;
}

function deepMerge(base, incoming) {
  if (!incoming) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(base).forEach((key) => {
    const incomingVal = incoming[key];
    if (incomingVal === undefined || incomingVal === null) return;
    if (Array.isArray(base[key])) {
      out[key] = incomingVal.length ? incomingVal : base[key];
    } else if (typeof base[key] === 'object') {
      out[key] = deepMerge(base[key], incomingVal);
    } else {
      out[key] = incomingVal;
    }
  });
  return out;
}
