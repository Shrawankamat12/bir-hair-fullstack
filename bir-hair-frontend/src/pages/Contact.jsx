import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { contactApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';

const emptyForm = { name: '', email: '', subject: '', message: '' };

const MAP_QUERY = encodeURIComponent(
  '71/7 A-18, Rama Road, Kirti Nagar Industrial Area, New Delhi - 110015'
);

const GOLD = '#c9a15a';
const BROWN = '#4a2c2a';

function IconBadge({ children }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 42,
        minWidth: 42,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${GOLD}, #e6c98a)`,
        color: '#fff',
        fontSize: '1.15rem',
        boxShadow: '0 4px 10px rgba(201,161,90,0.35)',
      }}
    >
      {children}
    </span>
  );
}

function InfoCard({ icon, title, children }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        padding: '20px 22px',
        marginBottom: 16,
        borderRadius: 16,
        border: `1px solid rgba(201,161,90,0.18)`,
        boxShadow: '0 6px 20px rgba(74,44,42,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <IconBadge>{icon}</IconBadge>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '2px 0 6px', color: BROWN, fontSize: '1rem' }}>{title}</h4>
        <div style={{ color: 'rgba(74,44,42,0.75)', lineHeight: 1.7, fontSize: '0.92rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'rgba(74,44,42,0.6)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Contact() {
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
      await contactApi.submit(form);
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      showError(err, 'Could not send your message — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Contact' }]}
        title="Contact Us"
        lede="Questions about an order, a bulk enquiry, or just want to say hello — we're here."
      />
      <Reveal as="section" className="section">
        <div
          className="container contact-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
            gap: 32,
            alignItems: 'stretch',
          }}
        >
          {/* LEFT: info + map */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InfoCard icon="📍" title="Factory Address">
              71/7 A-18, Rama Road, Kirti Nagar Industrial Area, Opposite Kirti Nagar Metro
              Station, New Delhi - 110015, Delhi, India
            </InfoCard>

            <InfoCard icon="📞" title="Phone &amp; Email">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <a href="tel:+919217411126" className="footer-contact-link">+91 9217411126</a>
                <a href="tel:+919999274990" className="footer-contact-link">+91 9999274990</a>
                <a href="tel:+919958871126" className="footer-contact-link">+91 9958871126</a>
                <a href="mailto:birhairfactory@gmail.com" className="footer-contact-link">
                  birhairfactory@gmail.com
                </a>
              </div>
            </InfoCard>

            <InfoCard icon="🕒" title="Business Hours">
              Monday – Saturday, 9:30 AM – 7:00 PM IST
              <br />
              Closed on national holidays
            </InfoCard>

            <a
              href="https://wa.me/919217411126"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #25D366, #1ebe5b)',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(37,211,102,0.3)',
                marginBottom: 20,
              }}
            >
              💬 Chat on WhatsApp
            </a>

            <div
              style={{
                flex: 1,
                minHeight: 220,
                overflow: 'hidden',
                borderRadius: 16,
                border: `1px solid rgba(201,161,90,0.18)`,
                boxShadow: '0 6px 20px rgba(74,44,42,0.08)',
              }}
            >
              <iframe
                title="B.I.R Hair India Factory Location"
                src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: 220 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* RIGHT: form */}
          <div
            className="card"
            style={{
              padding: 36,
              borderRadius: 20,
              border: `1px solid rgba(201,161,90,0.18)`,
              boxShadow: '0 10px 30px rgba(74,44,42,0.08)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sent ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 14,
                }}
              >
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${GOLD}, #e6c98a)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    color: '#fff',
                    boxShadow: '0 8px 20px rgba(201,161,90,0.35)',
                  }}
                >
                  ✓
                </span>
                <h3 style={{ margin: 0, color: BROWN }}>Message sent!</h3>
                <p style={{ color: 'rgba(74,44,42,0.7)', maxWidth: 320 }}>
                  Thanks for reaching out — we reply within one business day.
                </p>
                <button
                  className="btn btn-outline on-light btn-sm"
                  style={{ marginTop: 6 }}
                  onClick={() => setSent(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ marginBottom: 4, color: BROWN }}>Send a Message</h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(74,44,42,0.55)', marginBottom: 24 }}>
                  We reply within one business day.
                </p>

                <Field label="Full Name">
                  <input style={inputStyle} placeholder="Enter your full name" required {...field('name')} />
                </Field>

                <Field label="Email Address">
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="you@example.com"
                    required
                    {...field('email')}
                  />
                </Field>

                <Field label="Subject">
                  <input style={inputStyle} placeholder="What's this about?" {...field('subject')} />
                </Field>

                <Field label="Message">
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical' }}
                    rows="6"
                    placeholder="Tell us a bit more…"
                    required
                    {...field('message')}
                  />
                </Field>

                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{
                    marginTop: 10,
                    padding: '14px 20px',
                    borderRadius: 12,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </>
  );
}