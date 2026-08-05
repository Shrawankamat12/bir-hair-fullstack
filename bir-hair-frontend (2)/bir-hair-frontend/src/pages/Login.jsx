import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaApple, FaFacebookF } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import wigShelf from '../assets/photos/wig-shelf.jpg';

const perks = [
  'Premium Quality Hair',
  '100% Human Hair',
  'Fast & Reliable Shipping',
  '30 Days Easy Returns',
];

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
          <ul className="login-visual-perks">
            {perks.map((p) => (
              <li key={p}><FiCheck /> {p}</li>
            ))}
          </ul>
        </div>

        <div className="login-form-side">
          <div className="login-card">
            <Link to="/" className="login-card-brand">
              <span className="brand-mark login-brand-mark">
                <span className="brand-mark-ring" />
                <span className="brand-mark-letter">B</span>
              </span>
              <span className="login-card-brand-text">
                <strong>B.I.R Hair</strong>
                <span>Hair India Factory</span>
              </span>
            </Link>

            <div className="login-tabs">
              <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
              <button className={`login-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Create Account</button>
            </div>

            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="login-sub">{mode === 'login' ? 'Login to your account' : 'Sign up to get started'}</p>

            <form className="login-form" onSubmit={onSubmit}>
              {mode === 'register' && (
                <div className="login-form-row">
                  <input placeholder="First Name" required {...field('name')} />
                  <input placeholder="Last Name" />
                </div>
              )}
              <input type="email" placeholder="Email Address" required {...field('email')} />
              {mode === 'register' && <input type="tel" placeholder="Phone Number" {...field('phone')} />}
              <input type="password" placeholder="Password" required minLength={6} {...field('password')} />
              {mode === 'register' && <input type="password" placeholder="Confirm Password" required minLength={6} />}

              {mode === 'login' ? (
                <div className="login-row-between">
                  <label className="login-remember"><input type="checkbox" defaultChecked /> Remember Me</label>
                  <button type="button" className="login-forgot" onClick={() => showToast('Password reset coming soon', 'error')}>Forgot Password?</button>
                </div>
              ) : (
                <label className="login-remember login-terms">
                  <input type="checkbox" required /> I agree to the Terms &amp; Conditions and Privacy Policy
                </label>
              )}

              {formError && <p className="cart-coupon-msg" style={{ color: '#c81e5c' }}>{formError}</p>}
              <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <div className="login-divider"><span>Or continue with</span></div>
            <div className="login-social">
              <button type="button" aria-label="Continue with Google" onClick={() => showToast('Google sign-in is coming soon', 'error')}><FaGoogle /></button>
              <button type="button" aria-label="Continue with Apple" onClick={() => showToast('Apple sign-in is coming soon', 'error')}><FaApple /></button>
              <button type="button" aria-label="Continue with Facebook" onClick={() => showToast('Facebook sign-in is coming soon', 'error')}><FaFacebookF /></button>
            </div>

            <p className="login-switch">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <Link to="/" className="login-back">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
