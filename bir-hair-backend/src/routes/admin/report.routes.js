const router = require('express').Router();
const { salesReport, ordersReport, customersReport, inventoryReport, productsReport } = require('../../controllers/report.controller');

router.get('/sales', salesReport);
router.get('/orders', ordersReport);
router.get('/customers', customersReport);
router.get('/inventory', inventoryReport);
router.get('/products', productsReport);

module.exports = router;
