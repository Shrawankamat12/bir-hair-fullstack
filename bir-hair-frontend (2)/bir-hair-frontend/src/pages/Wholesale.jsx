import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { exportCountries } from '../data/content';
import { wholesaleApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';

const benefits = [
  ['Factory-Direct Pricing', 'Skip resellers entirely and buy at the same rate our own distributors do.', 'M12 2v20M2 12h20'],
  ['Private Labelling', 'Custom packaging and batch tagging available on qualifying orders.', 'M3 7h18v13H3z M8 7V4h8v3'],
  ['Dedicated Account Manager', 'A single point of contact for reordering, documentation and shipping updates.', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21a8 8 0 0 1 16 0'],
  ['Flexible Payment Terms', 'LC, T/T and partial-advance terms available for established partners.', 'M2 8h20M2 8v10h20V8M6 15h4'],
];

const emptyForm = { businessName: '', contactName: '', email: '', phone: '', country: '', estimatedMOQ: '', requirement: '' };

export default function Wholesale() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError } = useStore();

  function field(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await wholesaleApi.submit(form);
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      showError(err, 'Could not submit your enquiry — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader crumbs={[{ label: 'Export / Wholesale' }]} title="Export &amp; Wholesale Enquiry" lede="Bulk pricing, MOQs and export documentation for salons, distributors and importers." />

      <Reveal as="section" className="section">
        <div className="container wholesale-layout">
          <div>
            <div className="wholesale-benefits">
              {benefits.map(([t, d, path]) => (
                <div className="wholesale-benefit" key={t}>
                  <div className="wholesale-benefit-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
                  </div>
                  <div><h4>{t}</h4><p>{d}</p></div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: 6 }}>Minimum Order Quantities</h3>
            <table className="moq-table">
              <thead><tr><th>Product</th><th>MOQ</th><th>Lead Time</th></tr></thead>
              <tbody>
                <tr><td>Raw Bundles</td><td>25 kg</td><td>7–10 days</td></tr>
                <tr><td>Wefted Extensions</td><td>50 bundles</td><td>10–14 days</td></tr>
                <tr><td>Closures &amp; Frontals</td><td>30 pieces</td><td>10–14 days</td></tr>
                <tr><td>Wigs</td><td>20 pieces</td><td>14–18 days</td></tr>
              </tbody>
            </table>

            <h3 style={{ margin: '30px 0 12px' }}>We Export To</h3>
            <div className="export-countries">
              {exportCountries.map((c) => <span className="export-chip" key={c}>{c}</span>)}
              <span className="export-chip more">+ 38 more</span>
            </div>
          </div>

          {sent ? (
            <div className="card" style={{ padding: 30 }}>
              <h3 style={{ marginBottom: 8 }}>Thank you!</h3>
              <p>Your enquiry has been received — our export team will respond within 24 hours.</p>
              <button className="btn btn-outline on-light btn-sm" style={{ marginTop: 16 }} onClick={() => setSent(false)}>Submit Another Enquiry</button>
            </div>
          ) : (
            <form className="contact-form card" style={{ padding: 30 }} onSubmit={onSubmit}>
              <h3 style={{ marginBottom: 6 }}>B2B Enquiry Form</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(74,44,42,0.55)', marginBottom: 10 }}>Our export team responds within 24 hours.</p>
              <input placeholder="Company Name" required {...field('businessName')} />
              <input placeholder="Contact Person" required {...field('contactName')} />
              <input type="email" placeholder="Business Email" required {...field('email')} />
              <input placeholder="Phone Number" required {...field('phone')} />
              <input placeholder="Country" {...field('country')} />
              <input placeholder="Estimated Order Volume (kg / pieces)" {...field('estimatedMOQ')} />
              <textarea rows="4" placeholder="Tell us what you're looking for…" {...field('requirement')} />
              <button type="submit" className="btn btn-gold" style={{ marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </>
  );
}
