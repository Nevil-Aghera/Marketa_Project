import Supplier from '../models/Supplier.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 });
    successResponse(res, 200, 'Suppliers fetched successfully', suppliers);
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    successResponse(res, 200, 'Supplier fetched successfully', supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    successResponse(res, 201, 'Supplier created successfully', supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    successResponse(res, 200, 'Supplier updated successfully', supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    successResponse(res, 200, 'Supplier deleted successfully');
  } catch (error) {
    next(error);
  }
};
