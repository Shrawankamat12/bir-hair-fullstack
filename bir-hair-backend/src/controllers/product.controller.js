const asyncHandler = require('express-async-handler');
const productService = require('../services/product.service');

// GET /api/v1/products  (public: supports ?category=&texture=&hairType=&price[gte]=&sort=&search=&page=&limit=)
exports.getProducts = asyncHandler(async (req, res) => {
  const { data, total } = await productService.listPublic(req.query);
  res.json({ success: true, count: data.length, total, data });
});

// GET /api/v1/admin/products  (admin — includes inactive products)
exports.getProductsAdmin = asyncHandler(async (req, res) => {
  const data = await productService.listAdmin(req.query);
  res.json({ success: true, count: data.length, data });
});

// GET /api/v1/products/:idOrSlug
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getByIdOrSlug(req.params.idOrSlug);
  res.json({ success: true, data: product });
});

// POST /api/v1/admin/products  (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// PUT /api/v1/admin/products/:id  (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateById(req.params.id, req.body);
  res.json({ success: true, data: product });
});

// DELETE /api/v1/admin/products/:id  (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteById(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// GET /api/v1/products/badges/:badge  (Bestseller | New | Trending | Editor's Pick)
exports.getProductsByBadge = asyncHandler(async (req, res) => {
  const products = await productService.getByBadge(req.params.badge);
  res.json({ success: true, data: products });
});

// GET /api/v1/products/flag/:flag  (featured | newArrival | trending | premium | bestSeller | flashSale | recommended)
exports.getProductsByFlag = asyncHandler(async (req, res) => {
  const products = await productService.getByFlag(req.params.flag, Number(req.query.limit) || 12);
  res.json({ success: true, data: products });
});
