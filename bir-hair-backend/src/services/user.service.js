const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { userRepository } = require('../repositories');

class UserService extends BaseService {
  constructor() {
    super(userRepository, 'User');
  }

  async updateProfile(userId, { name, phone }) {
    return this.repository.updateById(userId, { name, phone });
  }

  async addAddress(userId, address) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    user.addresses.push(address);
    await user.save();
    return user.addresses;
  }

  async updateAddress(userId, addressId, payload) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const addr = user.addresses.id(addressId);
    if (!addr) throw new AppError('Address not found', 404);
    Object.assign(addr, payload);
    await user.save();
    return user.addresses;
  }

  async deleteAddress(userId, addressId) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();
    return user.addresses;
  }

  decorate(doc) {
    const u = doc.toObject ? doc.toObject() : doc;
    return { ...u, status: u.isActive };
  }

  async listAllAdmin(role) {
    const filter = role ? { role } : { role: { $in: ['admin', 'staff'] } };
    const rows = await this.repository.find(filter, { sort: '-createdAt' });
    return rows.map((u) => this.decorate(u));
  }

  /** Resolves the admin panel's `roleId` (custom Role doc) into the fixed `role`
   *  enum the auth middleware checks, and `status` into `isActive`. Both the
   *  resolved role name and the original roleId are kept on the user. */
  async resolveRole(payload) {
    const body = { ...payload };
    if (typeof body.status === 'boolean') { body.isActive = body.status; delete body.status; }
    if (body.roleId) {
      const { roleRepository } = require('../repositories');
      const roleDoc = await roleRepository.findById(body.roleId);
      body.role = roleDoc?.name?.toLowerCase().includes('admin') ? 'admin' : 'staff';
    }
    return body;
  }

  async createStaff(payload) {
    const tempPassword = payload.password || Math.random().toString(36).slice(-10) + 'A1!';
    const body = await this.resolveRole(payload);
    return this.repository.create({ ...body, password: tempPassword, role: body.role || 'staff' });
  }

  async updateAdmin(id, payload) {
    const body = await this.resolveRole(payload);
    return this.updateById(id, body);
  }
}

module.exports = new UserService();
