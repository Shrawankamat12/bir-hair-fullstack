const { isConfigured: cloudinaryConfigured } = require('../config/cloudinary');

class UploadService {
  /**
   * multer-storage-cloudinary attaches `path` (secure_url) and `filename` (public_id)
   * to req.file when Cloudinary is configured; the local diskStorage fallback
   * attaches `filename` only. Either way we return a single `url` field so
   * frontend/admin code never has to know which backend is in use.
   */
  buildResult(file) {
    if (cloudinaryConfigured && file.path) {
      return { url: file.path, publicId: file.filename };
    }
    return { url: `/uploads/${file.filename}` };
  }
}

module.exports = new UploadService();
