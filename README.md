# B.I.R Hair — Full Stack Project

Teen parts ek hi zip me:

```
bir-hair-fullstack/
├── bir-hair-frontend/     # aapka original React (Vite) storefront — Home, Shop, Cart, Checkout, Blog, etc.
├── bir-hair-backend/       # Node + Express + MongoDB REST API
└── bir-hair-admin/         # React (Vite) admin panel — products, orders, blogs, leads waghera manage karne ke liye
```

## Run order

**1. Backend (pehle ye start karo — API dono frontend/admin ko chahiye)**
```bash
cd bir-hair-backend
npm install
cp .env.example .env      # MONGO_URI, JWT_SECRET set karo
npm run seed                # categories + admin user create karta hai (admin@birhair.com / Admin@123)
npm run dev                 # http://localhost:5000
```

**2. Admin Panel**
```bash
cd bir-hair-admin
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000/api/v1
npm run dev                 # http://localhost:5174
```

**3. Storefront (frontend)**
```bash
cd bir-hair-frontend
npm install
npm run dev                 # usually http://localhost:5173
```
Abhi ye frontend static `src/data/products.js` use karta hai. Isko dynamic banane ke liye
`bir-hair-backend/README.md` me diye gaye endpoints (`/api/v1/products`, `/api/v1/categories`,
`/api/v1/blogs`, `/api/v1/testimonials`, `/api/v1/faqs`, `/api/v1/banners`, `/api/v1/coupons/apply`,
`/api/v1/orders`, `/api/v1/cart`, `/api/v1/wishlist`) se fetch/axios calls se replace karo.

## Detailed docs
- `bir-hair-backend/README.md` — sabhi models aur API routes ki full list
- `bir-hair-admin/README.md` — admin panel ke folders aur module mapping
