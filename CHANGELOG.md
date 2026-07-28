# B.I.R Hair India Factory — Changelog

## Phase 1 goal: a clean, production-ready **foundation** — not the premium redesign.
All existing routes, pages and functionality are preserved. Nothing was removed.

## Backend (`bir-hair-backend`)

- **New layered architecture**: `controllers/` → `services/` → `repositories/`
  (`src/repositories/base.repository.js`, `src/services/base.service.js`),
  applied to every resource (products, orders, cart, wishlist, users, reviews,
  coupons, banners, blogs, faqs, testimonials, contact, wholesale, dashboard, upload).
  Every original API route, response shape and status code is unchanged.
- **Validation**: `express-validator` chains in `src/validators/`, wired into every
  public and admin write route via `src/middleware/validate.middleware.js`.
- **Security**: helmet, rate limiting (general + a stricter one on
  login/register/admin-login), a hand-rolled Mongo-operator sanitizer, hpp.
- **Error handling**: `src/utils/AppError.js` + a central error middleware that
  also normalizes Mongoose CastError/ValidationError, duplicate-key errors, and
  JWT errors into consistent `{ success:false, message }` responses.
- **Logging**: winston (`src/config/logger.js`), HTTP access logs piped through it.
- **Uploads**: Cloudinary support (`src/config/cloudinary.js`) with automatic
  fallback to local disk storage if `CLOUDINARY_*` env vars aren't set — no
  behavior change if you don't configure Cloudinary yet.
- **Indexes**: added on `Product` (category+active, badge+active, stock),
  `Order` (user+date, status+date), `Review` (product+approved+date) for the
  query patterns the API actually uses.
- **Seed script** (`npm run seed`) now inserts sample categories, 10 products,
  testimonials, FAQs and a blog post — enough for the storefront to render
  real data immediately. Re-run it any time.
- New env vars in `.env.example`: `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`, `LOG_LEVEL`.
- New dependencies: `helmet`, `hpp`, `express-rate-limit`, `winston`, `compression`,
  `cloudinary`, `multer-storage-cloudinary`.

**Two real bugs were caught and fixed during this refactor** (pre-existing, not introduced by Phase 1):
none — both were introduced and caught in the same pass (an async/query-chaining bug in the new
dashboard service, and controller export names that didn't match what the original route files
imported). Every route import was cross-checked against actual controller exports before finishing.

## Frontend (`bir-hair-frontend`)

- **`src/data/products.js` removed.** Catalog data (products, categories,
  testimonials, blogs, FAQs) now comes from the live API. Marketing-only
  static content with no backend model (mega menu, process steps,
  certifications, export country list, before/after copy) moved to
  `src/data/content.js`.
- **API layer**: `src/lib/api.js` (fetch wrapper), `src/lib/resources.js`
  (one function per backend endpoint), `src/lib/normalize.js` (maps API
  response shapes onto the exact object shapes the existing components
  already expected, so page/component JSX didn't need to change).
- **Hooks**: `src/hooks/useAsync.js` (generic fetch-on-mount) and
  `src/hooks/useStoreData.js` (`useProducts`, `useProduct`, `useCategories`,
  `useBlogs`, `useFaqs`, `useTestimonials`, `useBanners`, `useProductReviews`, …).
- **Loading/empty/error states**: `src/components/Skeletons.jsx` (shimmer
  loaders), `src/components/StateBlocks.jsx` (empty/error blocks with retry).
- **`StoreContext` rewritten**: real session bootstrap (`/auth/me`), real
  login/register/logout, cart and wishlist now sync to the backend for
  logged-in users; guest browsing still works exactly as before and is pushed
  to the backend automatically on sign-in.
- **Real functionality wired end-to-end**: product reviews (submit + list),
  coupon apply, order placement + order confirmation with a real order
  number, account orders/tracking/addresses/profile, contact form, wholesale
  enquiry form — all now hit the real API instead of being static/fake.
- Every page that previously imported static data (`Home`, `Shop`,
  `ProductDetail`, `Cart`, `Checkout`, `Account`, `Login`, `BlogList`,
  `BlogDetail`, `FAQ`, `Search`, `Wholesale`, `Contact`, `Factory`, `Navbar`,
  `ProductCard`) was updated. No page was removed; visual structure/CSS classes
  were preserved so styling didn't change.
- **One real bug caught while rewriting `OrderConfirmation`**: a `useMemo` call
  was accidentally placed on the short-circuited side of `||`, which would
  have violated React's rules of hooks intermittently. Fixed before shipping.

## Admin (`bir-hair-admin`)

- `DataTable` extended with built-in search and pagination — **every existing
  list page gets both automatically**, no per-page changes needed, since the
  component's external API didn't change.
- Everything else (the existing `crudFactory` API pattern, `ConfirmDialog`,
  forms) was already clean and was left as-is.

## Explicitly NOT done in Phase 1 (by design — see the original scope split)

Payments (Razorpay/Stripe/PayPal), shipping integrations (Shiprocket/Delhivery),
OTP login, refresh tokens, roles/permissions enforcement, newsletter automation,
PDF/Excel reports, analytics dashboards, and the full luxury visual redesign are
all Phase 2–4 work and were intentionally left out per your instructions.

## Payments — Razorpay (added after Phase 1)

- **Backend**: `src/services/payment.service.js` creates Razorpay orders and verifies
  payment signatures server-side (never trusts the client alone). Routes at
  `/api/v1/payments/razorpay/{status,order,verify}`. `Order` model got
  `razorpayOrderId/PaymentId/Signature` fields.
- **Frontend**: `src/lib/razorpay.js` loads Razorpay Checkout and opens it;
  `Checkout.jsx` now creates the order, opens Razorpay for card/UPI, and verifies
  before showing the confirmation page. COD is unaffected and still works with
  zero configuration.
- **Requires your Razorpay keys** (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in
  the backend `.env`) to actually process payments. Without them, card/UPI
  checkout returns a clear "not set up yet" message and customers can still
  check out via Cash on Delivery — nothing breaks either way.

## Shipping — Shiprocket (added after Phase 1)

- **Backend**: `src/services/shipping.service.js` authenticates, creates an
  adhoc order, and assigns an AWB via the Shiprocket API. Admin endpoint
  `POST /api/v1/admin/orders/:id/ship` triggers it. `Order` model got
  `shiprocketShipmentId/AwbCode`, `courierName` fields.
- **Admin UI**: `OrderDetail.jsx` has a "Ship via Shiprocket" button that shows
  the assigned courier + AWB once shipped.
- **Requires your Shiprocket credentials** (`SHIPROCKET_EMAIL` /
  `SHIPROCKET_PASSWORD` / `SHIPROCKET_PICKUP_LOCATION`) — the pickup location
  must already exist in your Shiprocket dashboard. Without credentials, the
  button shows a clear error instead of silently failing.

## Admin analytics (added after Phase 1)

- Backend dashboard summary now includes a 14-day revenue time series and an
  order-status breakdown (`src/services/dashboard.service.js`).
- Admin `Dashboard.jsx` renders these with `recharts` (already a dependency):
  a revenue area chart and an order-status pie chart, alongside the existing
  stat cards, recent orders and low-stock list.

## Newsletter, CSV export, role restriction (added after Phase 1)

- **Newsletter**: real `/api/v1/newsletter/subscribe` endpoint + admin list
  endpoint. The Home page and Blog article newsletter forms (previously
  no-ops) now actually subscribe via `NewsletterForm.jsx`.
- **CSV export**: `bir-hair-admin/src/lib/exportCsv.js` — zero-dependency
  client-side CSV export, wired into the Orders and Products admin list pages
  ("Export CSV" button).
- **Role restriction**: changing another user's role/active-state
  (`PUT /admin/users/:id`) now requires the `admin` role specifically —
  `staff` accounts can no longer promote/demote other users. Added
  `requireRole(...roles)` middleware in `admin.middleware.js` for future use
  on other sensitive routes.

## Fixes after you reported them

- **`npm install` ERESOLVE conflict**: `multer-storage-cloudinary@4.0.0` peer-depends
  on `cloudinary@^1.21.0`, but `package.json` had `cloudinary@^2.5.1` pinned.
  Fixed by pinning `cloudinary@^1.41.3` instead — the 1.x line already exposes
  the same `.v2` API surface (`require('cloudinary').v2`) that `src/config/cloudinary.js`
  uses, so no code changes were needed, just the version.

## Honest scope note

The following were **not** attempted, and I want to be upfront about why rather
than deliver something shallow:

- **Full luxury visual redesign** (glassmorphism/3D/every-page redesign) — the
  existing storefront already has a working design system (gold/ivory palette,
  glass cards, scroll-reveal animations via `Reveal.jsx`). A ground-up visual
  redesign of every page is a multi-week design+build effort on its own, and
  doing it shallowly in one pass would likely look worse than what's there now.
- **Stripe / PayPal** — same pattern as Razorpay is possible, but wasn't built
  since Razorpay already covers the India-first use case implied by the brief;
  ask if you want the same treatment for Stripe/PayPal.
- **OTP login, refresh tokens, PDF export, email-based newsletter
  automation** (actually sending campaign emails, not just capturing
  subscribers) — genuinely not started. These are real, scoped features that
  deserve their own pass rather than being rushed.
- **I could not run `npm install` or boot the servers** in this environment
  (no network access) — everything here was verified statically (syntax
  checks, import/export cross-referencing, bracket-balance checks), not via a
  live smoke test. Please run the servers locally before deploying, and
  report back anything that doesn't work as expected.

## To run locally

```bash
# backend
cd bir-hair-backend && npm install && npm run seed && npm run dev

# frontend
cd bir-hair-frontend && npm install && npm run dev

# admin
cd bir-hair-admin && npm install && npm run dev
```

Admin login after seeding: `admin@birhair.com` / `Admin@123`.
