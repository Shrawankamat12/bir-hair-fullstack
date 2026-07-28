const router = require('express').Router();
const { getInventory, adjustInventory, getInventoryHistory } = require('../../controllers/inventory.controller');

router.get('/', getInventory);
router.post('/:productId/adjust', adjustInventory);
router.get('/:productId/history', getInventoryHistory);

module.exports = router;
