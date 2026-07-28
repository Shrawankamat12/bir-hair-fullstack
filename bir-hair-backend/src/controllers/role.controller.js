const asyncHandler = require('express-async-handler');
const roleService = require('../services/role.service');

exports.getRoles = asyncHandler(async (req, res) => {
  const data = await roleService.listAll();
  res.json({ success: true, data });
});

exports.getRole = asyncHandler(async (req, res) => {
  const data = await roleService.getById(req.params.id);
  res.json({ success: true, data });
});

exports.createRole = asyncHandler(async (req, res) => {
  const data = await roleService.create(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const data = await roleService.updateById(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteById(req.params.id);
  res.json({ success: true, message: 'Role deleted' });
});
