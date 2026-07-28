// Runs BEFORE express-validator on the admin product routes so validation
// rules (which check `category`/`mrp`) see the storefront field names even
// though the admin panel posts `categoryId` / `price` + `discountPrice`.
// The service layer (product.service.js#normalize) does the same mapping
// again on its own input — harmless, since by then the fields are already
// renamed and it's a no-op — but keeping it there too means the service
// stays correct even if called from somewhere that skips this middleware.
function normalizeProductBody(req, res, next) {
  const body = req.body || {};
  if (body.categoryId && !body.category) body.category = body.categoryId;
  if (body.price !== undefined && body.mrp === undefined) {
    body.mrp = body.price;
    if (body.discountPrice !== undefined && body.discountPrice !== '') body.price = body.discountPrice;
  }
  req.body = body;
  next();
}

module.exports = normalizeProductBody;
