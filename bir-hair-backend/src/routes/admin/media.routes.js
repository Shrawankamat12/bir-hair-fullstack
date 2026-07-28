const router = require('express').Router();
const upload = require('../../middleware/upload.middleware');
const { getMedia, getFolders, uploadMedia, deleteMedia } = require('../../controllers/media.controller');

router.get('/', getMedia);
router.get('/folders', getFolders);
router.post('/', upload.single('file'), uploadMedia);
router.delete('/:id', deleteMedia);

module.exports = router;
