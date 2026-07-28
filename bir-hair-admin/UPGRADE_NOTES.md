# BIR Hair Admin — Upgrade Notes

This upgrade brings the admin panel to feature parity with the Electric/Mitrnix
reference project's workflow depth, while keeping 100% of the original brand
colors, typography and spacing (all Tailwind utilities are mapped 1:1 to the
existing CSS custom properties in `tailwind.config.js` — nothing was redesigned).

## Setup
```
npm install
npm run dev
```
Tailwind, PostCSS and Autoprefixer were added as dev dependencies. Run `npm install`
once before starting the dev server.

## What changed
- **Foundation**: Tailwind wired in alongside the original CSS (nothing removed);
  a full reusable UI kit (`src/components/ui/`), a generic `EntityListPage` +
  `useEntityList` hook that gives every module search/filter/sort/pagination/
  bulk actions/CSV+Excel+print export for free, and a schema-driven
  `SimpleEntityForm` for simpler modules.
- **Every module in the brief** now has List → Add → Edit → Details (where
  applicable) → Delete → Search → Filter → Pagination → Bulk Actions →
  Image Preview: Hair Attributes (7 types), Categories, Sub Categories,
  Brands, Collections, Products (variants/gallery/video/SEO/preview/duplicate),
  Inventory (adjustments + history panel), Customers (orders/wishlist/reviews/
  addresses/payments tabs), Orders (timeline + invoice/packing slip/shipping
  label), Reviews, Coupons, Banners, Blog (+ categories + comments), Media
  Library, Dashboard (enterprise widgets + charts), Reports (5 report types),
  Notifications, Users, Roles & Permissions (full matrix), Activity Logs,
  Settings (8 tabs), Contact Messages, Wholesale Leads, Newsletter,
  Testimonials, FAQs.
- **New API service files** added for every new module, following the exact
  `crudFactory()` pattern already used in the project.

## Known limitations (be aware before shipping)
- **No backend was in either ZIP.** Every page calls a REST endpoint under
  `/admin/...` (matching the existing convention) — the actual Node/Express
  (or other) backend implementing these routes is not part of this codebase
  and needs to exist for real data to flow. Pages fail gracefully (empty
  states) when an endpoint isn't reachable, so nothing crashes.
- **Image cropping** was not implemented (no crop library is bundled and this
  environment has no network access to add one). Upload, multi-image gallery,
  drag-to-reorder, "set primary," and zoom preview are all implemented.
- **Excel export** uses a dependency-free HTML-table-as-`.xls` trick (Excel
  opens this natively) rather than a real `.xlsx` library, to avoid adding a
  new dependency sight-unseen. Swap in SheetJS if a native `.xlsx` is required.
- **Add/Edit for simpler modules** (Attributes, Brands, Collections, Coupons,
  Banners, FAQs, Testimonials, Subcategories, Roles) uses modal/drawer forms
  rather than dedicated routes — matches enterprise-panel convention and
  keeps the codebase DRY via `SimpleEntityForm`. Products, Categories, and
  Blog keep dedicated full-page routes since they're the most complex forms.
- This was built and syntax-verified (every file parses cleanly) without
  network access, so `npm install` + a manual click-through is recommended
  before deploying.
