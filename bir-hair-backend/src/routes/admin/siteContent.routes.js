const router = require('express').Router();
const { getSiteContent, updateSiteContent } = require('../../controllers/siteContent.controller');

router.get('/', getSiteContent);
router.put('/', updateSiteContent);

module.exports = router;
