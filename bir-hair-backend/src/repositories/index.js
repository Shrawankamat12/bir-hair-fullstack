const BaseRepository = require('./base.repository');

const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Blog = require('../models/Blog');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Faq = require('../models/Faq');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');
const WholesaleInquiry = require('../models/WholesaleInquiry');
const Wishlist = require('../models/Wishlist');
const ContactMessage = require('../models/ContactMessage');
const Newsletter = require('../models/Newsletter');

// --- Added for the admin panel upgrade ---
const SubCategory = require('../models/SubCategory');
const Brand = require('../models/Brand');
const Collection = require('../models/Collection');
const Attribute = require('../models/Attribute');
const Role = require('../models/Role');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const BlogCategory = require('../models/BlogCategory');
const BlogComment = require('../models/BlogComment');
const ActivityLog = require('../models/ActivityLog');
const MediaAsset = require('../models/MediaAsset');
const InventoryLog = require('../models/InventoryLog');
const SiteContent = require('../models/SiteContent');

// One repository instance per model. Most resources need nothing beyond
// generic CRUD/list, so a plain `new BaseRepository(Model)` is enough —
// services layer on top of these for anything resource-specific.
module.exports = {
  productRepository: new BaseRepository(Product),
  categoryRepository: new BaseRepository(Category),
  bannerRepository: new BaseRepository(Banner),
  blogRepository: new BaseRepository(Blog),
  cartRepository: new BaseRepository(Cart),
  couponRepository: new BaseRepository(Coupon),
  faqRepository: new BaseRepository(Faq),
  orderRepository: new BaseRepository(Order),
  reviewRepository: new BaseRepository(Review),
  testimonialRepository: new BaseRepository(Testimonial),
  userRepository: new BaseRepository(User),
  wholesaleRepository: new BaseRepository(WholesaleInquiry),
  wishlistRepository: new BaseRepository(Wishlist),
  contactRepository: new BaseRepository(ContactMessage),
  newsletterRepository: new BaseRepository(Newsletter),

  subCategoryRepository: new BaseRepository(SubCategory),
  brandRepository: new BaseRepository(Brand),
  collectionRepository: new BaseRepository(Collection),
  attributeRepository: new BaseRepository(Attribute),
  roleRepository: new BaseRepository(Role),
  notificationRepository: new BaseRepository(Notification),
  settingRepository: new BaseRepository(Setting),
  blogCategoryRepository: new BaseRepository(BlogCategory),
  blogCommentRepository: new BaseRepository(BlogComment),
  activityLogRepository: new BaseRepository(ActivityLog),
  mediaAssetRepository: new BaseRepository(MediaAsset),
  inventoryLogRepository: new BaseRepository(InventoryLog),
  siteContentRepository: new BaseRepository(SiteContent),
};
