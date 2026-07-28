const router = require('express').Router();
const upload = require('../../middleware/upload.middleware');
const { uploadImage, uploadImages } = require('../../controllers/upload.controller');

router.post('/', upload.single('image'), uploadImage);
router.post('/multiple', upload.array('images', 20), uploadImages);

module.exports = router;
