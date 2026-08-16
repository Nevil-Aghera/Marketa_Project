import Category from '../models/Category.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc   Get all categories
// @route  GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    successResponse(res, 200, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};

// @desc   Create category
// @route  POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    successResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc   Update category
// @route  PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return errorResponse(res, 404, 'Category not found');
    successResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete category
// @route  DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return errorResponse(res, 404, 'Category not found');
    successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
