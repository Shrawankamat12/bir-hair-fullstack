import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, forgotPassword, resetPassword, showToast } = useStore();

  const redirectTo = location.state?.from || '/account';

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate(redirectTo);
        return;
      }

      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (form.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        navigate(redirectTo);
        return;
      }

      if (mode === 'forgot') {
        if (!form.email) throw new Error('Please enter your email address');
        await forgotPassword(form.email);
        return;
      }

      if (mode === 'reset') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (form.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) throw new Error('Reset token is missing or invalid');

        await resetPassword(token, form.password);
        setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setMode('login');
        showToast('Password reset successfully. Please login.');
      }
    } catch (err) {
      setFormError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = 'http://localhost:5000/api/v1/auth/google';
  }

  function loginWithFacebook() {
    window.location.href = 'http://localhost:5000/api/v1/auth/facebook';
  }

  function switchMode(nextMode) {
    setFormError('');
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setMode(nextMode);
  }

  const inputClass =
    'w-full rounded-xl border border-pink-100 bg-[#fff8fa] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#ef6c9d] focus:bg-white';

  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-h,0px))] items-start justify-center bg-gradient-to-br from-[#fff9fb] via-[#fff0f5] to-[#ffe3ee] px-5 py-6">
      <div className="w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_70px_-25px_rgba(226,36,103,0.32)]">

        {/* ===================== FORM ===================== */}
        <div className="flex items-center justify-center px-6 py-6 sm:px-9">
          <div className="w-full max-w-[380px]">

            {/* BRAND */}
            <Link to="/" className="mb-3 flex items-center gap-2.5">
              <span className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f8b4ca] via-[#f58bb1] to-[#e22467] shadow-[0_6px_14px_rgba(226,36,103,0.35)]">
                <span className="absolute -inset-[2px] rounded-full border border-white/40" />
                <span className="font-serif text-lg font-bold text-white">B</span>
              </span>
              <span className="flex flex-col leading-tight">
                <strong className="font-serif text-sm text-gray-900">B.I.R Hair</strong>
                <span className="text-[0.68rem] tracking-wide text-gray-400">Hair India Factory</span>
              </span>
            </Link>

            {/* TABS */}
            {(mode === 'login' || mode === 'register') && (
              <div className="mb-4 flex gap-1 rounded-full bg-[#fff5f8] p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#e22467] shadow-[0_4px_12px_rgba(226,36,103,0.18)]'
                      : 'text-gray-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-[#e22467] shadow-[0_4px_12px_rgba(226,36,103,0.18)]'
                      : 'text-gray-400'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* TITLE */}
            <h1 className="mb-1 font-serif text-xl font-bold text-gray-900">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'reset' && 'Reset Password'}
            </h1>

            <p className="mb-4 text-sm leading-snug text-gray-500">
              {mode === 'login' && 'Login to your account'}
              {mode === 'register' && 'Sign up to get started'}
              {mode === 'forgot' && 'Enter your email and we will send you a password reset link'}
              {mode === 'reset' && 'Create a new password for your account'}
            </p>

            {/* FORM */}
            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              {mode === 'register' && (
                <>
                  <input placeholder="Full Name" required className={inputClass} {...field('name')} />
                  <input type="tel" placeholder="Phone Number" className={inputClass} {...field('phone')} />
                </>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className={inputClass}
                  {...field('email')}
                />
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <input
                  type="password"
                  placeholder={mode === 'reset' ? 'New Password' : 'Password'}
                  required
                  minLength={8}
                  className={inputClass}
                  {...field('password')}
                />
              )}

              {(mode === 'register' || mode === 'reset') && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  minLength={8}
                  className={inputClass}
                  {...field('confirmPassword')}
                />
              )}

              {mode === 'login' && (
                <div className="-mt-0.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500">
                    <input type="checkbox" defaultChecked className="accent-[#ef6c9d]" />
                    Remember Me
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#e22467]"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <label className="flex items-start gap-1.5 text-[0.72rem] leading-snug text-gray-500">
                  <input type="checkbox" required className="mt-0.5 accent-[#ef6c9d]" />
                  I agree to the Terms &amp; Conditions and Privacy Policy
                </label>
              )}

              {formError && <p className="-mt-1 text-xs font-medium text-[#c81e5c]">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full rounded-xl bg-gradient-to-r from-[#f58bb1] to-[#e22467] py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(226,36,103,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(226,36,103,0.38)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting
                  ? 'Please wait…'
                  : mode === 'login'
                  ? 'Login'
                  : mode === 'register'
                  ? 'Sign Up'
                  : mode === 'forgot'
                  ? 'Send Reset Link'
                  : 'Reset Password'}
              </button>
            </form>

            {/* SOCIAL LOGIN */}
            {mode === 'login' && (
              <>
                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-pink-100" />
                  <span className="whitespace-nowrap text-[0.7rem] text-gray-400">Or continue with</span>
                  <span className="h-px flex-1 bg-pink-100" />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    aria-label="Continue with Google"
                    onClick={loginWithGoogle}
                    className="flex flex-1 items-center justify-center rounded-xl border border-pink-100 bg-white py-2.5 text-gray-700 transition-colors hover:border-[#ef6c9d] hover:bg-[#fff5f8]"
                  >
                    <FaGoogle />
                  </button>
                  <button
                    type="button"
                    aria-label="Continue with Facebook"
                    onClick={loginWithFacebook}
                    className="flex flex-1 items-center justify-center rounded-xl border border-pink-100 bg-white py-2.5 text-gray-700 transition-colors hover:border-[#ef6c9d] hover:bg-[#fff5f8]"
                  >
                    <FaFacebookF />
                  </button>
                </div>
              </>
            )}

            {/* SWITCH LINKS */}
            {mode === 'login' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button type="button" className="font-bold text-[#e22467]" onClick={() => switchMode('register')}>
                  Sign Up
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" className="font-bold text-[#e22467]" onClick={() => switchMode('login')}>
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Remember your password?{' '}
                <button type="button" className="font-bold text-[#e22467]" onClick={() => switchMode('login')}>
                  Sign In
                </button>
              </p>
            )}

            {mode === 'reset' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Remember your password?{' '}
                <button type="button" className="font-bold text-[#e22467]" onClick={() => switchMode('login')}>
                  Sign In
                </button>
              </p>
            )}

            <Link to="/" className="mt-3.5 block text-center text-xs text-gray-400 hover:text-[#e22467]">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}