# B.I.R Hair — Admin Panel (React + Vite)

## Setup
```bash
cd bir-hair-admin
npm install
cp .env.example .env    # VITE_API_BASE_URL -> backend URL
npm run dev               # runs on http://localhost:5174
```
Login with the seeded admin: `admin@birhair.com` / `Admin@123` (created by backend's `npm run seed`).

## Folder Structure
```
bir-hair-admin/
├── index.html
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx / App.jsx        # routes for every module below
    ├── api/                       # one file per resource, axios calls to /api/v1/admin/*
    │   ├── axiosInstance.js        # baseURL + auth token/cookie handling
    │   ├── crudFactory.js          # generates getAll/getOne/create/update/remove
    │   └── product.api.js, category.api.js, order.api.js, ...
    ├── context/
    │   └── AuthContext.jsx         # admin session, login/logout
    ├── layouts/
    │   └── AdminLayout.jsx         # sidebar + topbar shell
    ├── components/
    │   ├── Sidebar.jsx, Topbar.jsx
    │   ├── DataTable.jsx           # generic list table w/ edit & delete
    │   ├── StatCard.jsx            # dashboard KPI cards
    │   ├── ConfirmDialog.jsx
    │   └── ProtectedRoute.jsx      # redirects to /login if not authenticated
    ├── pages/
    │   ├── Login.jsx, Dashboard.jsx
    │   ├── products/ (ProductList, ProductForm)
    │   ├── categories/ (CategoryList — inline add/edit)
    │   ├── orders/ (OrderList, OrderDetail — status + tracking updates)
    │   ├── customers/ (CustomerList)
    │   ├── blogs/ (BlogList, BlogForm)
    │   ├── testimonials/, coupons/, banners/, faqs/  (inline add/edit + table)
    │   ├── wholesale/ (WholesaleLeads — lead status pipeline)
    │   ├── messages/ (ContactMessages)
    │   └── settings/ (Settings — placeholder for store config)
    └── styles/index.css
```

## How it makes the storefront dynamic
Every module here maps 1:1 to a backend model/route (see `bir-hair-backend/README.md`):
Products, Categories, Orders, Customers, Blog, Testimonials, FAQs, Banners, Coupons,
Wholesale Inquiries, Contact Messages. Adding/editing data here updates MongoDB, and the
public storefront (`bir-hair` frontend) reflects it immediately once its static
`src/data/products.js` imports are replaced with API calls to the backend.

## Next steps to wire up
1. Point `VITE_API_BASE_URL` at your deployed backend.
2. In the `bir-hair` frontend, replace `src/data/products.js` static exports with
   `fetch`/`axios` calls to `/api/v1/products`, `/api/v1/categories`, `/api/v1/blogs`, etc.
3. Extend `ProductForm`/`CategoryList` styling as needed — table/form components are
   intentionally generic (`DataTable`, `admin-form` CSS class) so new modules (e.g. Settings)
   reuse them with minimal code.
