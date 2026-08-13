import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CompareTray from './components/CompareTray';

import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));

const Login = lazy(() => import('./pages/Login'));
const Account = lazy(() => import('./pages/Account'));

const Wishlist = lazy(() => import('./pages/Wishlist'));
const Search = lazy(() => import('./pages/Search'));
const About = lazy(() => import('./pages/About'));
const Factory = lazy(() => import('./pages/Factory'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const Policy = lazy(() => import('./pages/Policy'));
const NotFound = lazy(() => import('./pages/NotFound'));


/* ============================================================
   SCROLL TO TOP
============================================================ */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


/* ============================================================
   LOADING FALLBACK
============================================================ */

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        className="brand-mark"
        style={{ '--bm-size': '46px' }}
      >
        <span className="brand-mark-ring" />
        <span className="brand-mark-letter">B</span>
      </span>
    </div>
  );
}


/* ============================================================
   APP
============================================================ */

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Navbar />

      <main>
        <Suspense fallback={<RouteFallback />}>
          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* SHOP */}
            <Route
              path="/shop"
              element={<Shop />}
            />

            <Route
              path="/product/:id"
              element={<ProductDetail />}
            />

            {/* CART */}
            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* CHECKOUT */}
            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/order-confirmation"
              element={<OrderConfirmation />}
            />

            {/* AUTH
                Login.jsx handles:
                - Login
                - Register
                - Forgot Password
                - Google Login
                - Facebook Login
            */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* ACCOUNT */}
            <Route
              path="/account"
              element={<Account />}
            />

            {/* CUSTOMER */}
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/search"
              element={<Search />}
            />

            {/* COMPANY */}
            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/factory"
              element={<Factory />}
            />

            <Route
              path="/journal"
              element={<BlogList />}
            />

            <Route
              path="/journal/:id"
              element={<BlogDetail />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/faq"
              element={<FAQ />}
            />

            <Route
              path="/wholesale"
              element={<Wholesale />}
            />

            <Route
              path="/export"
              element={<Wholesale />}
            />

            {/* POLICY */}
            <Route
              path="/policy/:type"
              element={<Policy />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Suspense>
      </main>

      <Footer />

      <Toast />

      <CompareTray />
    </>
  );
}