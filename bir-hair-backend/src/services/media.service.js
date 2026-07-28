const { mediaAssetRepository } = require('../repositories');
const { cloudinary, isConfigured } = require('../config/cloudinary');

class MediaService {
  async list(folder) {
    const filter = folder ? { folder } : {};
    return mediaAssetRepository.find(filter, { sort: '-createdAt' });
  }

  async folders() {
    const all = await mediaAssetRepository.find({});
    return [...new Set(all.map((a) => a.folder || 'general'))];
  }

  async save({ file, folder, userId }) {
    const isCloud = isConfigured && file.path;
    return mediaAssetRepository.create({
      url: isCloud ? file.path : `/uploads/${file.filename}`,
      publicId: isCloud ? file.filename : undefined,
      folder: folder || 'general',
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
    });
  }

  async remove(id) {
    const asset = await mediaAssetRepository.findById(id);
    if (!asset) return null;
    if (isConfigured && asset.publicId) {
      try { await cloudinary.uploader.destroy(asset.publicId); } catch (_) { /* best-effort */ }
    }
    return mediaAssetRepository.deleteById(id);
  }
}

module.exports = new MediaService();
