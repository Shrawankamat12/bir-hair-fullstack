import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import wigShelf from '../assets/photos/wig-shelf.jpg';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, showToast } = useStore();

  const redirectTo = location.state?.from || '/account';

  function field(key) {
    return { value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      }
      navigate(redirectTo);
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-panel">
        <div className="login-visual" style={{ backgroundImage: `url(${wigShelf})` }}>
          <div className="login-visual-scrim" />
          <Link to="/" className="login-visual-brand">
            <span className="brand-mark login-brand-mark">
              <span className="brand-mark-ring" />
              <span className="brand-mark-letter">B</span>
            </span>
            <span className="login-visual-brand-text">
              <strong>B.I.R</strong>
              <span>Hair India Factory</span>
            </span>
          </Link>
          <div className="login-visual-quote">
            <p>&ldquo;Factory-direct 100% human hair, trusted by exporters in 50+ countries.&rdquo;</p>
            <span className="login-visual-stars">★★★★★ <em>4.9 from 3,200+ buyers</em></span>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-card">
            <div className="login-tabs">
              <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
              <button className={`login-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Create Account</button>
            </div>

            <h1>{mode === 'login' ? 'Welcome back' : 'Join the B.I.R Circle'}</h1>
            <p className="login-sub">{mode === 'login' ? 'Sign in to track orders and manage your wishlist.' : 'Create an account to save favourites and speed up checkout.'}</p>

            <div className="login-social">
              <button type="button" className="btn btn-outline on-light" onClick={() => showToast('Google sign-in is coming soon', 'error')}>Continue with Google</button>
              <button type="button" className="btn btn-outline on-light" onClick={() => showToast('Facebook sign-in is coming soon', 'error')}>Continue with Facebook</button>
            </div>
            <div className="login-divider"><span>or</span></div>

            <form className="login-form" onSubmit={onSubmit}>
              {mode === 'register' && <input placeholder="Full Name" required {...field('name')} />}
              <input type="email" placeholder="Email Address" required {...field('email')} />
              {mode === 'register' && <input type="tel" placeholder="Phone Number" {...field('phone')} />}
              <input type="password" placeholder="Password" required minLength={6} {...field('password')} />
              {formError && <p className="cart-coupon-msg" style={{ color: '#b42828' }}>{formError}</p>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="login-switch">
              {mode === 'login' ? "New here?" : 'Already have an account?'}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
            <Link to="/" className="login-back">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
