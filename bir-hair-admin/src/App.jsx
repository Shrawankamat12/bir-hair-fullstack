import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

import ProductList from './pages/products/ProductList.jsx';
import ProductForm from './pages/products/ProductForm.jsx';
import ProductDetails from './pages/products/ProductDetails.jsx';
import ProductPreview from './pages/products/ProductPreview.jsx';

import CategoryList from './pages/categories/CategoryList.jsx';
import CategoryForm from './pages/categories/CategoryForm.jsx';
import CategoryDetails from './pages/categories/CategoryDetails.jsx';
import SubcategoryList from './pages/subcategories/SubcategoryList.jsx';
import CollectionList from './pages/collections/CollectionList.jsx';
import BrandList from './pages/brands/BrandList.jsx';
import AttributeList from './pages/attributes/AttributeList.jsx';
import InventoryList from './pages/inventory/InventoryList.jsx';

import OrderList from './pages/orders/OrderList.jsx';
import OrderDetails from './pages/orders/OrderDetails.jsx';
import OrderInvoice from './pages/orders/OrderInvoice.jsx';
import OrderPackingSlip from './pages/orders/OrderPackingSlip.jsx';
import OrderShippingLabel from './pages/orders/OrderShippingLabel.jsx';

import CustomerList from './pages/customers/CustomerList.jsx';
import CustomerDetails from './pages/customers/CustomerDetails.jsx';

import ReviewList from './pages/reviews/ReviewList.jsx';
import CouponList from './pages/coupons/CouponList.jsx';
import BannerList from './pages/banners/BannerList.jsx';

import BlogList from './pages/blogs/BlogList.jsx';
import BlogForm from './pages/blogs/BlogForm.jsx';
import BlogCategoryList from './pages/blog-categories/BlogCategoryList.jsx';
import BlogCommentList from './pages/blog-comments/BlogCommentList.jsx';

import MediaLibrary from './pages/media/MediaLibrary.jsx';
import Reports from './pages/reports/Reports.jsx';
import NotificationList from './pages/notifications/NotificationList.jsx';

import UserList from './pages/users/UserList.jsx';
import RoleList from './pages/roles/RoleList.jsx';
import ActivityLogList from './pages/activity-logs/ActivityLogList.jsx';
import Settings from './pages/settings/Settings.jsx';

import ContactMessages from './pages/messages/ContactMessages.jsx';
import WholesaleLeads from './pages/wholesale/WholesaleLeads.jsx';
import NewsletterList from './pages/newsletter/NewsletterList.jsx';
import TestimonialList from './pages/testimonials/TestimonialList.jsx';
import FaqList from './pages/faqs/FaqList.jsx';
import SiteContentEditor from './pages/site-content/SiteContentEditor.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/products/:id/preview" element={<ProductPreview />} />

          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/:id" element={<CategoryDetails />} />
          <Route path="/categories/:id/edit" element={<CategoryForm />} />

          <Route path="/subcategories" element={<SubcategoryList />} />
          <Route path="/collections" element={<CollectionList />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/attributes" element={<AttributeList />} />
          <Route path="/inventory" element={<InventoryList />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/invoice" element={<OrderInvoice />} />
          <Route path="/orders/:id/packing-slip" element={<OrderPackingSlip />} />
          <Route path="/orders/:id/shipping-label" element={<OrderShippingLabel />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />

          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/coupons" element={<CouponList />} />
          <Route path="/banners" element={<BannerList />} />

          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/new" element={<BlogForm />} />
          <Route path="/blogs/:id/edit" element={<BlogForm />} />
          <Route path="/blog-categories" element={<BlogCategoryList />} />
          <Route path="/blog-comments" element={<BlogCommentList />} />

          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<NotificationList />} />

          <Route path="/users" element={<UserList />} />
          <Route path="/roles" element={<RoleList />} />
          <Route path="/activity-logs" element={<ActivityLogList />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/testimonials" element={<TestimonialList />} />
          <Route path="/faqs" element={<FaqList />} />
          <Route path="/wholesale-leads" element={<WholesaleLeads />} />
          <Route path="/messages" element={<ContactMessages />} />
          <Route path="/newsletter" element={<NewsletterList />} />
          <Route path="/site-content" element={<SiteContentEditor />} />
        </Route>
      </Route>
    </Routes>
  );
}
