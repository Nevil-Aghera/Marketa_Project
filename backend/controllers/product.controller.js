import Product from '../models/Product.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import fs from 'fs';
import path from 'path';

// @desc   Get all products
// @route  GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock, outOfStock } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (lowStock === 'true') filter.isLowStock = true;
    if (outOfStock === 'true') filter.isOutOfStock = true;

    const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    successResponse(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return errorResponse(res, 404, 'Product not found');
    successResponse(res, 200, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc   Create product
// @route  POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.file) productData.image = `/uploads/${req.file.filename}`;

    const product = await Product.create(productData);
    await product.populate('category', 'name');
    successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found');

    if (req.file) {
      // Remove old image
      if (product.image) {
        const oldPath = path.join(process.cwd(), product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(product, req.body);
    const updated = await product.save();
    await updated.populate('category', 'name');
    successResponse(res, 200, 'Product updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return errorResponse(res, 404, 'Product not found');
    if (product.image) {
      const imgPath = path.join(process.cwd(), product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};
