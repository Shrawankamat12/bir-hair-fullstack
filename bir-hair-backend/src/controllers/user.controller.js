const asyncHandler = require('express-async-handler');
const userService = require('../services/user.service');

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: user });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.addAddress(req.user._id, req.body);
  res.status(201).json({ success: true, data: addresses });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.updateAddress(req.user._id, req.params.addressId, req.body);
  res.json({ success: true, data: addresses });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await userService.deleteAddress(req.user._id, req.params.addressId);
  res.json({ success: true, data: addresses });
});

exports.getAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await userService.listAllAdmin(req.query.role);
  res.json({ success: true, data: users });
});

exports.getUserAdmin = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, data: user });
});

exports.createUserAdmin = asyncHandler(async (req, res) => {
  const user = await userService.createStaff(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.updateUserAdmin = asyncHandler(async (req, res) => {
  const user = await userService.updateAdmin(req.params.id, req.body);
  res.json({ success: true, data: user });
});

exports.deleteUserAdmin = asyncHandler(async (req, res) => {
  await userService.deleteById(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});
