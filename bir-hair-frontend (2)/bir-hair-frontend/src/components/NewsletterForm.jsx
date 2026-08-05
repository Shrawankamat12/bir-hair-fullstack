import { useState } from 'react';
import { newsletterApi } from '../lib/resources';
import { useStore } from '../context/StoreContext';

export default function NewsletterForm({ className = 'newsletter-form' }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, showError } = useStore();

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await newsletterApi.subscribe(email);
      showToast("You're subscribed!");
      setEmail('');
    } catch (err) {
      showError(err, 'Could not subscribe right now');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className="btn btn-gold" disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</button>
    </form>
  );
}
