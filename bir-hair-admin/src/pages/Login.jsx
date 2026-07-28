import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="login-panel-brand">
            <img src="/logo.png" alt="B.I.R Hair Factory India" />
            <span>B.I.R Hair Factory India</span>
          </div>
          <div className="login-panel-copy">
            <h2>Manage your store, one place at a time.</h2>
            <p>Products, orders, customers, and content — everything for B.I.R Hair Factory India lives in this admin panel.</p>
          </div>
          <div className="login-panel-foot">© {new Date().getFullYear()} B.I.R Hair Factory India. All rights reserved.</div>
        </div>
      </div>

      <div className="login-form-side">
        <form className="login-box" onSubmit={handleSubmit}>
          <div className="login-box-logo">
            <img src="/logo.png" alt="B.I.R Hair Factory India" />
          </div>
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your admin account to continue</p>

          {error && <p className="login-error">{error}</p>}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
              </svg>
              <input id="email" type="email" placeholder="you@birhair.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="login-toggle-visibility" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="m1 1 22 22" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-row-between">
            <label className="login-remember">
              <input type="checkbox" /> Remember me
            </label>
            <a className="login-forgot" href="#">Forgot password?</a>
          </div>

          <button type="submit">Sign In</button>
          <p className="login-footnote">Access restricted to authorized B.I.R Hair staff only.</p>
        </form>
      </div>
    </div>
  );
}
