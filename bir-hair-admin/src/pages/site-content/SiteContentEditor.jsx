import { useEffect, useState } from 'react';
import { getSiteContent, updateSiteContent } from '../../api/siteContent.api.js';
import { PageHeader, Card, Button, Tabs, FormField, Input, Textarea, Switch, Repeater, OrderList } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';

const SECTION_LABELS = {
  hero: 'Hero Slider',
  categories: 'Categories',
  featuredCategories: 'Featured Categories',
  newArrivals: 'New Arrivals',
  trending: 'Trending',
  premium: 'Premium',
  bestSellers: 'Best Sellers',
  featured: 'Featured',
  flashSale: 'Flash Sale',
  collections: 'Collections',
  whyChooseUs: 'Why Choose Us',
  process: 'Our Process',
  factoryGallery: 'Factory Gallery',
  certifications: 'Certifications',
  exportCountries: 'Export Countries',
  beforeAfter: 'Before / After',
  offers: 'Offers',
  instagram: 'Instagram Feed',
  videoReviews: 'Video Reviews',
  couponBanner: 'Coupon Banner',
  testimonials: 'Testimonials',
  faqTeaser: 'FAQ Teaser',
};

const empty = {
  homeSectionOrder: Object.keys(SECTION_LABELS),
  hero: { slides: [] },
  whyChooseUs: { heading: '', subheading: '', items: [] },
  process: { heading: '', subheading: '', steps: [] },
  factoryGallery: { heading: '', subheading: '', images: [] },
  certifications: { heading: '', items: [] },
  exportCountries: { heading: '', subheading: '', countries: [] },
  beforeAfter: { heading: '', subheading: '', items: [] },
  instagram: { heading: '', handle: '', posts: [] },
  videoReviews: { heading: '', videos: [] },
  couponBanner: { enabled: false, text: '', code: '', link: '' },
  footer: {
    aboutText: '', logo: '', columns: [],
    socials: { facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '', pinterest: '' },
    paymentIcons: [], bottomText: '',
  },
  header: {
    announcementBar: { enabled: false, text: '', link: '' },
    navLinks: [], topBarPhone: '', topBarEmail: '',
  },
};

const TABS = [
  { value: 'order', label: 'Section Order' },
  { value: 'hero', label: 'Hero Slider' },
  { value: 'whyChooseUs', label: 'Why Choose Us' },
  { value: 'process', label: 'Process' },
  { value: 'factoryGallery', label: 'Factory Gallery' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'exportCountries', label: 'Export Countries' },
  { value: 'beforeAfter', label: 'Before / After' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'videoReviews', label: 'Video Reviews' },
  { value: 'couponBanner', label: 'Coupon Banner' },
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
];

export default function SiteContentEditor() {
  const toast = useToast();
  const [tab, setTab] = useState('order');
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent()
      .then((data) => setValues({ ...empty, ...data, footer: { ...empty.footer, ...data?.footer, socials: { ...empty.footer.socials, ...data?.footer?.socials } }, header: { ...empty.header, ...data?.header, announcementBar: { ...empty.header.announcementBar, ...data?.header?.announcementBar } } }))
      .catch(() => toast.error('Could not load site content'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (section, patch) => setValues((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  const save = async () => {
    setSaving(true);
    try {
      const data = await updateSiteContent(values);
      setValues({ ...empty, ...data });
      toast.success('Site content saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save site content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading site content…" />;

  return (
    <div>
      <PageHeader
        title="Site Content"
        subtitle="Controls the storefront home page, header, and footer — changes go live immediately."
        actions={<Button onClick={save} loading={saving}>Save Changes</Button>}
      />

      <Card padded={false}>
        <div className="px-5 pt-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="px-5 pb-6">

          {tab === 'order' && (
            <div className="max-w-xl">
              <p className="text-xs text-ink-faint mb-3">Controls the top-to-bottom order of sections on the storefront home page.</p>
              <OrderList
                items={values.homeSectionOrder}
                labels={SECTION_LABELS}
                onChange={(next) => setValues((s) => ({ ...s, homeSectionOrder: next }))}
              />
            </div>
          )}

          {tab === 'hero' && (
            <div className="max-w-4xl">
              <p className="text-xs text-ink-faint mb-3">Slides shown in the home page hero carousel, in order.</p>
              <Repeater
                items={values.hero.slides}
                onChange={(slides) => set('hero', { slides })}
                addLabel="+ Add Slide"
                emptyLabel="No hero slides yet."
                fields={[
                  { key: 'image', label: 'Image URL', placeholder: 'https://…' },
                  { key: 'mobileImage', label: 'Mobile Image URL', placeholder: 'https://…' },
                  { key: 'title', label: 'Title' },
                  { key: 'subtitle', label: 'Subtitle' },
                  { key: 'ctaText', label: 'Button Text' },
                  { key: 'ctaLink', label: 'Button Link' },
                ]}
              />
            </div>
          )}

          {tab === 'whyChooseUs' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.whyChooseUs.heading} onChange={(e) => set('whyChooseUs', { heading: e.target.value })} /></FormField>
                <FormField label="Subheading"><Input value={values.whyChooseUs.subheading} onChange={(e) => set('whyChooseUs', { subheading: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.whyChooseUs.items}
                onChange={(items) => set('whyChooseUs', { items })}
                addLabel="+ Add Point"
                emptyLabel="No points added yet."
                fields={[
                  { key: 'icon', label: 'Icon (name or URL)' },
                  { key: 'title', label: 'Title' },
                  { key: 'description', label: 'Description', type: 'textarea', span: 2 },
                ]}
              />
            </div>
          )}

          {tab === 'process' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.process.heading} onChange={(e) => set('process', { heading: e.target.value })} /></FormField>
                <FormField label="Subheading"><Input value={values.process.subheading} onChange={(e) => set('process', { subheading: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.process.steps}
                onChange={(steps) => set('process', { steps })}
                addLabel="+ Add Step"
                emptyLabel="No steps added yet."
                fields={[
                  { key: 'icon', label: 'Icon (name or URL)' },
                  { key: 'title', label: 'Title' },
                  { key: 'description', label: 'Description', type: 'textarea', span: 2 },
                ]}
              />
            </div>
          )}

          {tab === 'factoryGallery' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.factoryGallery.heading} onChange={(e) => set('factoryGallery', { heading: e.target.value })} /></FormField>
                <FormField label="Subheading"><Input value={values.factoryGallery.subheading} onChange={(e) => set('factoryGallery', { subheading: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.factoryGallery.images}
                onChange={(images) => set('factoryGallery', { images })}
                addLabel="+ Add Image"
                emptyLabel="No images added yet."
                fields={[
                  { key: 'url', label: 'Image URL', placeholder: 'https://…' },
                  { key: 'caption', label: 'Caption' },
                ]}
              />
            </div>
          )}

          {tab === 'certifications' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <FormField label="Heading" className="max-w-md"><Input value={values.certifications.heading} onChange={(e) => set('certifications', { heading: e.target.value })} /></FormField>
              <Repeater
                items={values.certifications.items}
                onChange={(items) => set('certifications', { items })}
                addLabel="+ Add Certification"
                emptyLabel="No certifications added yet."
                fields={[
                  { key: 'logo', label: 'Logo URL', placeholder: 'https://…' },
                  { key: 'name', label: 'Name' },
                  { key: 'link', label: 'Link', span: 2 },
                ]}
              />
            </div>
          )}

          {tab === 'exportCountries' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.exportCountries.heading} onChange={(e) => set('exportCountries', { heading: e.target.value })} /></FormField>
                <FormField label="Subheading"><Input value={values.exportCountries.subheading} onChange={(e) => set('exportCountries', { subheading: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.exportCountries.countries}
                onChange={(countries) => set('exportCountries', { countries })}
                addLabel="+ Add Country"
                emptyLabel="No countries added yet."
                fields={[
                  { key: 'name', label: 'Country Name' },
                  { key: 'flag', label: 'Flag (emoji or URL)' },
                ]}
              />
            </div>
          )}

          {tab === 'beforeAfter' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.beforeAfter.heading} onChange={(e) => set('beforeAfter', { heading: e.target.value })} /></FormField>
                <FormField label="Subheading"><Input value={values.beforeAfter.subheading} onChange={(e) => set('beforeAfter', { subheading: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.beforeAfter.items}
                onChange={(items) => set('beforeAfter', { items })}
                addLabel="+ Add Comparison"
                emptyLabel="No before/after items added yet."
                fields={[
                  { key: 'beforeImage', label: 'Before Image URL' },
                  { key: 'afterImage', label: 'After Image URL' },
                  { key: 'caption', label: 'Caption', span: 2 },
                ]}
              />
            </div>
          )}

          {tab === 'instagram' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading"><Input value={values.instagram.heading} onChange={(e) => set('instagram', { heading: e.target.value })} /></FormField>
                <FormField label="Handle" hint="e.g. @birhairfactory"><Input value={values.instagram.handle} onChange={(e) => set('instagram', { handle: e.target.value })} /></FormField>
              </div>
              <Repeater
                items={values.instagram.posts}
                onChange={(posts) => set('instagram', { posts })}
                addLabel="+ Add Post"
                emptyLabel="No posts added yet."
                fields={[
                  { key: 'image', label: 'Image URL' },
                  { key: 'link', label: 'Post Link' },
                ]}
              />
            </div>
          )}

          {tab === 'videoReviews' && (
            <div className="max-w-4xl flex flex-col gap-4">
              <FormField label="Heading" className="max-w-md"><Input value={values.videoReviews.heading} onChange={(e) => set('videoReviews', { heading: e.target.value })} /></FormField>
              <Repeater
                items={values.videoReviews.videos}
                onChange={(videos) => set('videoReviews', { videos })}
                addLabel="+ Add Video"
                emptyLabel="No videos added yet."
                fields={[
                  { key: 'thumbnail', label: 'Thumbnail URL' },
                  { key: 'videoUrl', label: 'Video URL' },
                  { key: 'customerName', label: 'Customer Name' },
                  { key: 'caption', label: 'Caption' },
                ]}
              />
            </div>
          )}

          {tab === 'couponBanner' && (
            <div className="max-w-2xl flex flex-col gap-4">
              <Switch checked={values.couponBanner.enabled} onChange={(v) => set('couponBanner', { enabled: v })} label="Show coupon banner on home page" />
              <FormField label="Banner Text"><Input value={values.couponBanner.text} onChange={(e) => set('couponBanner', { text: e.target.value })} placeholder="Get 15% off on your first order" /></FormField>
              <FormField label="Coupon Code"><Input value={values.couponBanner.code} onChange={(e) => set('couponBanner', { code: e.target.value })} placeholder="WELCOME15" /></FormField>
              <FormField label="Link"><Input value={values.couponBanner.link} onChange={(e) => set('couponBanner', { link: e.target.value })} /></FormField>
            </div>
          )}

          {tab === 'header' && (
            <div className="max-w-3xl flex flex-col gap-6">
              <div>
                <p className="text-[13px] font-semibold text-ink mb-2">Announcement Bar</p>
                <div className="flex flex-col gap-3">
                  <Switch
                    checked={values.header.announcementBar.enabled}
                    onChange={(v) => set('header', { announcementBar: { ...values.header.announcementBar, enabled: v } })}
                    label="Show announcement bar"
                  />
                  <FormField label="Text">
                    <Input value={values.header.announcementBar.text} onChange={(e) => set('header', { announcementBar: { ...values.header.announcementBar, text: e.target.value } })} placeholder="Free shipping on orders above ₹5000" />
                  </FormField>
                  <FormField label="Link">
                    <Input value={values.header.announcementBar.link} onChange={(e) => set('header', { announcementBar: { ...values.header.announcementBar, link: e.target.value } })} />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Top Bar Phone"><Input value={values.header.topBarPhone} onChange={(e) => set('header', { topBarPhone: e.target.value })} /></FormField>
                <FormField label="Top Bar Email"><Input value={values.header.topBarEmail} onChange={(e) => set('header', { topBarEmail: e.target.value })} /></FormField>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-ink mb-2">Nav Links</p>
                <Repeater
                  items={values.header.navLinks}
                  onChange={(navLinks) => set('header', { navLinks })}
                  addLabel="+ Add Nav Link"
                  emptyLabel="No nav links added yet."
                  fields={[
                    { key: 'label', label: 'Label' },
                    { key: 'url', label: 'URL' },
                  ]}
                />
              </div>
            </div>
          )}

          {tab === 'footer' && (
            <div className="max-w-3xl flex flex-col gap-6">
              <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <FormField label="Logo">
                  <SingleImageUpload value={values.footer.logo} onChange={(v) => set('footer', { logo: v })} label="Logo" aspect="aspect-[3/1]" />
                </FormField>
                <FormField label="About Text">
                  <Textarea rows={4} value={values.footer.aboutText} onChange={(e) => set('footer', { aboutText: e.target.value })} />
                </FormField>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-ink mb-2">Social Links</p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(values.footer.socials).map((key) => (
                    <FormField key={key} label={key[0].toUpperCase() + key.slice(1)}>
                      <Input
                        value={values.footer.socials[key]}
                        onChange={(e) => set('footer', { socials: { ...values.footer.socials, [key]: e.target.value } })}
                        placeholder="https://…"
                      />
                    </FormField>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-ink mb-2">Footer Columns</p>
                <div className="flex flex-col gap-3">
                  {values.footer.columns.map((col, idx) => (
                    <div key={idx} className="border border-border-soft rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Input
                          value={col.title || ''}
                          onChange={(e) => {
                            const next = [...values.footer.columns];
                            next[idx] = { ...next[idx], title: e.target.value };
                            set('footer', { columns: next });
                          }}
                          placeholder="Column title"
                          className="max-w-xs"
                        />
                        <button
                          type="button"
                          onClick={() => set('footer', { columns: values.footer.columns.filter((_, i) => i !== idx) })}
                          className="text-xs text-danger font-semibold ml-auto"
                        >
                          Remove Column
                        </button>
                      </div>
                      <Repeater
                        items={col.links || []}
                        onChange={(links) => {
                          const next = [...values.footer.columns];
                          next[idx] = { ...next[idx], links };
                          set('footer', { columns: next });
                        }}
                        addLabel="+ Add Link"
                        emptyLabel="No links yet."
                        fields={[
                          { key: 'label', label: 'Label' },
                          { key: 'url', label: 'URL' },
                        ]}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => set('footer', { columns: [...values.footer.columns, { title: '', links: [] }] })}
                  >
                    + Add Column
                  </Button>
                </div>
              </div>

              <FormField label="Bottom Text" hint="e.g. copyright line shown at the very bottom of the footer">
                <Input value={values.footer.bottomText} onChange={(e) => set('footer', { bottomText: e.target.value })} />
              </FormField>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
