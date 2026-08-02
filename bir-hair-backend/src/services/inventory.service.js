const AppError = require('../utils/AppError');
const { productRepository, inventoryLogRepository } = require('../repositories');

class InventoryService {
  async list() {
    const products = await productRepository.find(
      {},
      {
        select: 'name sku stock minStock',
        sort: 'name',
      }
    );

    return products.map((product) => {
      const stock = product.stock || 0;
      const minStock = product.minStock || 5;

      return {
        ...product.toObject(),

        stockStatus:
          stock === 0
            ? 'Out of Stock'
            : stock <= minStock
            ? 'Low Stock'
            : 'In Stock',

        isLowStock: stock > 0 && stock <= minStock,
        isOutOfStock: stock === 0,
      };
    });
  }

  async adjust(productId, { delta, reason }, userId) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const stockAfter = Math.max(
      0,
      (product.stock || 0) + Number(delta)
    );

    await productRepository.updateById(productId, {
      stock: stockAfter,
    });

    await inventoryLogRepository.create({
      product: productId,
      delta: Number(delta),
      reason: reason || 'correction',
      stockAfter,
      adjustedBy: userId,
    });

    return {
      productId,
      stock: stockAfter,
      minStock: product.minStock,

      stockStatus:
        stockAfter === 0
          ? 'Out of Stock'
          : stockAfter <= product.minStock
          ? 'Low Stock'
          : 'In Stock',

      isLowStock:
        stockAfter > 0 && stockAfter <= product.minStock,

      isOutOfStock: stockAfter === 0,
    };
  }

  async history(productId) {
    return inventoryLogRepository.find(
      { product: productId },
      {
        sort: '-createdAt',
      }
    );
  }
}

module.exports = new InventoryService();