const BaseService = require('./base.service');
const AppError = require('../utils/AppError');
const { roleRepository } = require('../repositories');

class RoleService extends BaseService {
  constructor() {
    super(roleRepository, 'Role');
  }

  async listAll() {
    return this.repository.find({}, { sort: 'name' });
  }

  async deleteById(id) {
    const role = await this.repository.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    if (role.isSystem) throw new AppError('Built-in roles cannot be deleted', 400);
    return super.deleteById(id);
  }
}

module.exports = new RoleService();
