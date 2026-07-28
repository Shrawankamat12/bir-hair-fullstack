const router = require('express').Router();
const { getAllSubscribersAdmin, deleteSubscriberAdmin } = require('../../controllers/newsletter.controller');

router.get('/', getAllSubscribersAdmin);
router.delete('/:id', deleteSubscriberAdmin);

module.exports = router;
