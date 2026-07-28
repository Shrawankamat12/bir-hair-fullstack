import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../api/settings.api.js';
import { PageHeader, Card, Tabs, Button, FormField, Input, Textarea, Switch } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'seo', label: 'SEO' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'payment', label: 'Payment' },
  { value: 'tax', label: 'Tax' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social Links' },
];

const empty = {
  storeName: '', storeEmail: '', storePhone: '', storeAddress: '', logo: '', favicon: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
  freeShippingThreshold: '', flatShippingRate: '', shippingZones: '',
  paymentGateway: '', razorpayKey: '', codEnabled: true,
  taxRate: '', taxLabel: 'GST',
  smtpHost: '', smtpPort: '', smtpUser: '', smtpFrom: '',
  smsProvider: '', smsApiKey: '',
  facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '',
};

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getSettings().then((data) => setValues({ ...empty, ...data })).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await updateSettings(values); toast.success('Settings saved'); }
    catch { toast.error('Could not reach settings endpoint — changes were not persisted.'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading settings…" />;

  return (
    <div>
      <PageHeader title="Website Settings" subtitle="Store-wide configuration." actions={<Button onClick={save} loading={saving}>Save Changes</Button>} />
      <Card padded={false}>
        <div className="px-5 pt-4"><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>
        <div className="px-5 pb-6 max-w-3xl">
          {tab === 'general' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Store Name" className="col-span-2 sm:col-span-1"><Input value={values.storeName} onChange={(e) => set('storeName', e.target.value)} /></FormField>
              <FormField label="Store Email" className="col-span-2 sm:col-span-1"><Input type="email" value={values.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} /></FormField>
              <FormField label="Store Phone" className="col-span-2 sm:col-span-1"><Input value={values.storePhone} onChange={(e) => set('storePhone', e.target.value)} /></FormField>
              <FormField label="Store Address" className="col-span-2"><Textarea value={values.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} /></FormField>
              <FormField label="Logo"><SingleImageUpload value={values.logo} onChange={(v) => set('logo', v)} label="Logo" /></FormField>
              <FormField label="Favicon"><SingleImageUpload value={values.favicon} onChange={(v) => set('favicon', v)} label="Favicon" /></FormField>
            </div>
          )}
          {tab === 'seo' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Default SEO Title" className="col-span-2"><Input value={values.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></FormField>
              <FormField label="Default SEO Description" className="col-span-2"><Textarea value={values.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} /></FormField>
              <FormField label="Default SEO Keywords" className="col-span-2"><Input value={values.seoKeywords} onChange={(e) => set('seoKeywords', e.target.value)} /></FormField>
            </div>
          )}
          {tab === 'shipping' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Free Shipping Threshold"><Input type="number" value={values.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', e.target.value)} /></FormField>
              <FormField label="Flat Shipping Rate"><Input type="number" value={values.flatShippingRate} onChange={(e) => set('flatShippingRate', e.target.value)} /></FormField>
              <FormField label="Shipping Zones" className="col-span-2" hint="Comma-separated list of serviceable regions"><Textarea value={values.shippingZones} onChange={(e) => set('shippingZones', e.target.value)} /></FormField>
            </div>
          )}
          {tab === 'payment' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Payment Gateway"><Input value={values.paymentGateway} onChange={(e) => set('paymentGateway', e.target.value)} placeholder="Razorpay, Stripe…" /></FormField>
              <FormField label="Gateway API Key"><Input value={values.razorpayKey} onChange={(e) => set('razorpayKey', e.target.value)} /></FormField>
              <div className="col-span-2"><Switch checked={values.codEnabled} onChange={(v) => set('codEnabled', v)} label="Cash on Delivery Enabled" /></div>
            </div>
          )}
          {tab === 'tax' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tax Label"><Input value={values.taxLabel} onChange={(e) => set('taxLabel', e.target.value)} /></FormField>
              <FormField label="Tax Rate (%)"><Input type="number" value={values.taxRate} onChange={(e) => set('taxRate', e.target.value)} /></FormField>
            </div>
          )}
          {tab === 'email' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SMTP Host"><Input value={values.smtpHost} onChange={(e) => set('smtpHost', e.target.value)} /></FormField>
              <FormField label="SMTP Port"><Input value={values.smtpPort} onChange={(e) => set('smtpPort', e.target.value)} /></FormField>
              <FormField label="SMTP User"><Input value={values.smtpUser} onChange={(e) => set('smtpUser', e.target.value)} /></FormField>
              <FormField label="From Address"><Input value={values.smtpFrom} onChange={(e) => set('smtpFrom', e.target.value)} /></FormField>
            </div>
          )}
          {tab === 'sms' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="SMS Provider"><Input value={values.smsProvider} onChange={(e) => set('smsProvider', e.target.value)} placeholder="Twilio, MSG91…" /></FormField>
              <FormField label="API Key"><Input value={values.smsApiKey} onChange={(e) => set('smsApiKey', e.target.value)} /></FormField>
            </div>
          )}
          {tab === 'social' && (
            <div className="grid grid-cols-2 gap-4">
              {['facebook', 'instagram', 'twitter', 'youtube', 'whatsapp'].map((k) => (
                <FormField key={k} label={k[0].toUpperCase() + k.slice(1)}><Input value={values[k]} onChange={(e) => set(k, e.target.value)} placeholder="https://…" /></FormField>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
