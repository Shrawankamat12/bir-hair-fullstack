const { activityLogRepository } = require('../repositories');

class ActivityLogService {
  async listAll(filter = {}) {
    const logs = await activityLogRepository.find(filter, { sort: '-createdAt', limit: 200, populate: 'user' });
    return logs.map((l) => ({
      ...(l.toObject ? l.toObject() : l),
      message: `${l.action}${l.entity ? ` ${l.entity}` : ''}${l.entityId ? ` (${String(l.entityId).slice(-6)})` : ''}`,
    }));
  }

  /** Fire-and-forget audit entry — swallow errors so logging never breaks a request. */
  async log({ user, action, entity, entityId, meta }) {
    try {
      await activityLogRepository.create({
        user: user?._id, userName: user?.name || 'System', action, entity, entityId, meta,
      });
    } catch (_) { /* logging must never break the primary request */ }
  }
}

module.exports = new ActivityLogService();
