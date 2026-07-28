const AppError = require('../utils/AppError');
const { userRepository } = require('../repositories');
const generateToken = require('../utils/generateToken');
const { ADMIN_ROLES } = require('../constants/roles');

// Same JWT-in-httpOnly-cookie flow as before — the structure here just
// gives us one place to later add refresh tokens without touching controllers again.
class AuthService {
  async register({ name, email, phone, password }) {
    const exists = await userRepository.findOne({ email });
    if (exists) throw new AppError('Email already registered', 400);

    const user = await userRepository.create({ name, email, phone, password });
    const token = generateToken(user._id);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await userRepository.model.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    const token = generateToken(user._id);
    return { user, token };
  }

  async adminLogin({ email, password }) {
    const user = await userRepository.model.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)) || !ADMIN_ROLES.includes(user.role)) {
      throw new AppError('Invalid admin credentials', 401);
    }
    const token = generateToken(user._id);
    return { user, token };
  }

  toPublicUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }
}

module.exports = new AuthService();
