import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import { contactApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';
import './Content.css';

const emptyForm = { name: '', email: '', subject: '', message: '' };

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

  return (
    <>
      <PageHeader crumbs={[{ label: 'Contact' }]} title="Contact Us" lede="Questions about an order, a bulk enquiry, or just want to say hello — we're here." />
      <Reveal as="section" className="section">
        <div className="container contact-layout">
          <div>
            <div className="contact-info-card card">
              <h4>Factory Address</h4>
              <p>Kirti Nagar Industrial Area, New Delhi, 110015, India</p>
            </div>
            <div className="contact-info-card card">
              <h4>Phone &amp; Email</h4>
              <p>+91 98-XXXX-XXXX<br/>export@birhairindia.com</p>
            </div>
            <div className="contact-info-card card">
              <h4>Business Hours</h4>
              <p>Monday – Saturday, 9:30 AM – 7:00 PM IST<br/>Closed on national holidays</p>
            </div>
            <a href="https://wa.me/910000000000" className="contact-whatsapp" target="_blank" rel="noreferrer">💬 Chat on WhatsApp</a>
            <div className="contact-map">
              <PhotoBlock tone="beige" ratio="16/9" rounded={0} label="Map" sub="Kirti Nagar, New Delhi" strands={false} />
            </div>
          </div>

          {sent ? (
            <div className="card" style={{ padding: 30 }}>
              <h3 style={{ marginBottom: 8 }}>Message sent!</h3>
              <p>Thanks for reaching out — we reply within one business day.</p>
              <button className="btn btn-outline on-light btn-sm" style={{ marginTop: 16 }} onClick={() => setSent(false)}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form card" style={{ padding: 30 }} onSubmit={onSubmit}>
              <h3 style={{ marginBottom: 6 }}>Send a Message</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(74,44,42,0.55)', marginBottom: 10 }}>We reply within one business day.</p>
              <input placeholder="Full Name" required {...field('name')} />
              <input type="email" placeholder="Email Address" required {...field('email')} />
              <input placeholder="Subject" {...field('subject')} />
              <textarea rows="5" placeholder="Your message…" required {...field('message')} />
              <button type="submit" className="btn btn-gold" style={{ marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </>
  );
}
