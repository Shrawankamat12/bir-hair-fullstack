const mongoose = require('mongoose');
const SubCategory = require('../models/SubCategory');

exports.listAll = async (filter = {}) => {
  const match = {};
  if (filter.categoryId) {
    match.categoryId = new mongoose.Types.ObjectId(filter.categoryId);
  }

  const subcategories = await SubCategory.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'subcategory',
        as: 'products',
      },
    },
    {
      $addFields: {
        productCount: { $size: '$products' },
      },
    },
    { $project: { products: 0 } },
    { $sort: { sortOrder: 1, createdAt: -1 } },
  ]);

  return subcategories;
};

exports.getById = async (id) => {
  const subcategory = await SubCategory.findById(id);
  if (!subcategory) {
    const err = new Error('Sub-category not found');
    err.statusCode = 404;
    throw err;
  }
  return subcategory;
};

exports.create = async (data) => {
  const subcategory = await SubCategory.create(data);
  return subcategory;
};

exports.updateById = async (id, data) => {
  const subcategory = await SubCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!subcategory) {
    const err = new Error('Sub-category not found');
    err.statusCode = 404;
    throw err;
  }
  return subcategory;
};

exports.deleteById = async (id) => {
  const subcategory = await SubCategory.findByIdAndDelete(id);
  if (!subcategory) {
    const err = new Error('Sub-category not found');
    err.statusCode = 404;
    throw err;
  }
  return subcategory;
};