const router = require('express').Router();
const { getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('../../controllers/banner.controller');

router.get('/', getAllBannersAdmin);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
