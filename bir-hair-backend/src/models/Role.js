const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  permissions: [{ type: String }], // e.g. ['products:read', 'products:write', 'orders:read', ...]
  permissionMatrix: { type: mongoose.Schema.Types.Mixed }, // { [moduleName]: ['view','create','edit','delete'] }
  isSystem: { type: Boolean, default: false }, // built-in roles (Admin/Staff/Customer) can't be deleted
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
