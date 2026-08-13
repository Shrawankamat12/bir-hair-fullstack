import { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import {
  FaGoogle,
  FaFacebookF,
} from 'react-icons/fa';

import { FiCheck } from 'react-icons/fi';

import {
  useStore,
} from '../context/StoreContext';

import wigShelf from '../assets/photos/wig-shelf.jpg';

const perks = [
  'Premium Quality Hair',
  '100% Human Hair',
  'Fast & Reliable Shipping',
  '30 Days Easy Returns',
];


export default function Login() {
  const [mode, setMode] =
    useState('login');

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
    register,
    forgotPassword,
    resetPassword,
    showToast,
  } = useStore();


  const redirectTo =
    location.state?.from ||
    '/account';


  /* ============================================================
     FIELD
  ============================================================ */

  function field(key) {
    return {
      value: form[key],
      onChange: (e) =>
        setForm((f) => ({
          ...f,
          [key]: e.target.value,
        })),
    };
  }


  /* ============================================================
     SUBMIT
  ============================================================ */

  async function onSubmit(e) {
    e.preventDefault();

    setFormError('');
    setSubmitting(true);

    try {
      /* --------------------------------------------------------
         LOGIN
      -------------------------------------------------------- */

      if (mode === 'login') {
        await login(
          form.email,
          form.password
        );

        navigate(redirectTo);
        return;
      }


      /* --------------------------------------------------------
         REGISTER
      -------------------------------------------------------- */

      if (mode === 'register') {
        if (
          form.password !==
          form.confirmPassword
        ) {
          throw new Error(
            'Passwords do not match'
          );
        }

        if (
          form.password.length < 8
        ) {
          throw new Error(
            'Password must be at least 8 characters'
          );
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


      /* --------------------------------------------------------
         FORGOT PASSWORD
      -------------------------------------------------------- */

      if (mode === 'forgot') {
        if (!form.email) {
          throw new Error(
            'Please enter your email address'
          );
        }

        await forgotPassword(
          form.email
        );

        return;
      }


      /* --------------------------------------------------------
         RESET PASSWORD
      -------------------------------------------------------- */

      if (mode === 'reset') {
        if (
          form.password !==
          form.confirmPassword
        ) {
          throw new Error(
            'Passwords do not match'
          );
        }

        if (
          form.password.length < 8
        ) {
          throw new Error(
            'Password must be at least 8 characters'
          );
        }

        const params =
          new URLSearchParams(
            window.location.search
          );

        const token =
          params.get('token');

        if (!token) {
          throw new Error(
            'Reset token is missing or invalid'
          );
        }

        await resetPassword(
          token,
          form.password
        );

        setForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });

        setMode('login');

        showToast(
          'Password reset successfully. Please login.'
        );
      }

    } catch (err) {
      setFormError(
        err?.message ||
          'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  }


  /* ============================================================
     GOOGLE LOGIN
  ============================================================ */

  function loginWithGoogle() {
    window.location.href =
      'http://localhost:5000/api/v1/auth/google';
  }


  /* ============================================================
     FACEBOOK LOGIN
  ============================================================ */

  function loginWithFacebook() {
    window.location.href =
      'http://localhost:5000/api/v1/auth/facebook';
  }


  /* ============================================================
     SWITCH MODE
  ============================================================ */

  function switchMode(nextMode) {
    setFormError('');

    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });

    setMode(nextMode);
  }


  return (
    <div className="login-wrap">

      <div className="login-panel">

        {/* ====================================================
            VISUAL SIDE
        ==================================================== */}

        <div
          className="login-visual"
          style={{
            backgroundImage:
              `url(${wigShelf})`,
          }}
        >
          <div className="login-visual-scrim" />

          <ul className="login-visual-perks">
            {perks.map((p) => (
              <li key={p}>
                <FiCheck />
                {p}
              </li>
            ))}
          </ul>
        </div>


        {/* ====================================================
            FORM SIDE
        ==================================================== */}

        <div className="login-form-side">

          <div className="login-card">


            {/* BRAND */}

            <Link
              to="/"
              className="login-card-brand"
            >
              <span className="brand-mark login-brand-mark">
                <span className="brand-mark-ring" />
                <span className="brand-mark-letter">
                  B
                </span>
              </span>

              <span className="login-card-brand-text">
                <strong>
                  B.I.R Hair
                </strong>

                <span>
                  Hair India Factory
                </span>
              </span>
            </Link>


            {/* ==================================================
                LOGIN / REGISTER TABS
            ================================================== */}

            {(mode === 'login' ||
              mode === 'register') && (
              <div className="login-tabs">

                <button
                  type="button"
                  className={`login-tab ${
                    mode === 'login'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    switchMode('login')
                  }
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={`login-tab ${
                    mode === 'register'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    switchMode(
                      'register'
                    )
                  }
                >
                  Create Account
                </button>

              </div>
            )}


            {/* ==================================================
                TITLE
            ================================================== */}

            <h1>
              {mode === 'login' &&
                'Welcome Back'}

              {mode === 'register' &&
                'Create Account'}

              {mode === 'forgot' &&
                'Forgot Password'}

              {mode === 'reset' &&
                'Reset Password'}
            </h1>


            <p className="login-sub">

              {mode === 'login' &&
                'Login to your account'}

              {mode === 'register' &&
                'Sign up to get started'}

              {mode === 'forgot' &&
                'Enter your email and we will send you a password reset link'}

              {mode === 'reset' &&
                'Create a new password for your account'}

            </p>


            {/* ==================================================
                FORM
            ================================================== */}

            <form
              className="login-form"
              onSubmit={onSubmit}
            >


              {/* REGISTER */}

              {mode === 'register' && (
                <>
                  <div className="login-form-row">

                    <input
                      placeholder="Full Name"
                      required
                      {...field('name')}
                    />

                  </div>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    {...field('phone')}
                  />
                </>
              )}


              {/* EMAIL */}

              {(mode === 'login' ||
                mode === 'register' ||
                mode === 'forgot') && (
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  {...field('email')}
                />
              )}


              {/* PASSWORD */}

              {(mode === 'login' ||
                mode === 'register' ||
                mode === 'reset') && (
                <input
                  type="password"
                  placeholder={
                    mode === 'reset'
                      ? 'New Password'
                      : 'Password'
                  }
                  required
                  minLength={8}
                  {...field('password')}
                />
              )}


              {/* CONFIRM PASSWORD */}

              {(mode === 'register' ||
                mode === 'reset') && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  minLength={8}
                  {...field(
                    'confirmPassword'
                  )}
                />
              )}


              {/* LOGIN OPTIONS */}

              {mode === 'login' && (
                <div className="login-row-between">

                  <label className="login-remember">
                    <input
                      type="checkbox"
                      defaultChecked
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="login-forgot"
                    onClick={() =>
                      switchMode(
                        'forgot'
                      )
                    }
                  >
                    Forgot Password?
                  </button>

                </div>
              )}


              {/* REGISTER TERMS */}

              {mode === 'register' && (
                <label className="login-remember login-terms">

                  <input
                    type="checkbox"
                    required
                  />

                  I agree to the Terms &
                  Conditions and Privacy
                  Policy

                </label>
              )}


              {/* ERROR */}

              {formError && (
                <p
                  className="cart-coupon-msg"
                  style={{
                    color: '#c81e5c',
                  }}
                >
                  {formError}
                </p>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="btn btn-gold"
                style={{
                  width: '100%',
                }}
                disabled={submitting}
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


            {/* ==================================================
                SOCIAL LOGIN
            ================================================== */}

            {mode === 'login' && (
              <>
                <div className="login-divider">
                  <span>
                    Or continue with
                  </span>
                </div>

                <div className="login-social">

                  <button
                    type="button"
                    aria-label="Continue with Google"
                    onClick={
                      loginWithGoogle
                    }
                  >
                    <FaGoogle />
                  </button>

                  <button
                    type="button"
                    aria-label="Continue with Facebook"
                    onClick={
                      loginWithFacebook
                    }
                  >
                    <FaFacebookF />
                  </button>

                </div>
              </>
            )}


            {/* ==================================================
                SWITCH
            ================================================== */}

            {mode === 'login' && (
              <p className="login-switch">
                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'register'
                    )
                  }
                >
                  Sign Up
                </button>
              </p>
            )}


            {mode === 'register' && (
              <p className="login-switch">
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'login'
                    )
                  }
                >
                  Sign In
                </button>
              </p>
            )}


            {mode === 'forgot' && (
              <p className="login-switch">

                Remember your password?{' '}

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'login'
                    )
                  }
                >
                  Sign In
                </button>

              </p>
            )}


            {mode === 'reset' && (
              <p className="login-switch">

                Remember your password?{' '}

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'login'
                    )
                  }
                >
                  Sign In
                </button>

              </p>
            )}


            <Link
              to="/"
              className="login-back"
            >
              ← Back to Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}