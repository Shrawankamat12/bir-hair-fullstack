const multer = require('multer');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Same public API as before: `upload.single('image')`. Internally picks
// Cloudinary storage when CLOUDINARY_* env vars are set, otherwise falls
// back to the original local disk storage — nothing else needs to change.
let storage;

if (isConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'bir-hair',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'src/uploads'),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('Only image files are allowed'), ok);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
