const router = require('express').Router();
const { getHeroSlider } = require('../controllers/heroSlider.controller');

router.get('/', getHeroSlider);

module.exports = router;