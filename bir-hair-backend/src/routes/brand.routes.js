const router = require('express').Router();
const { getBrands } = require('../controllers/brand.controller');

router.get('/', getBrands);

module.exports = router;
