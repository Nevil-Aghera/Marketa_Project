import Customer from '../models/Customer.model.js';
import Sale from '../models/Sale.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    successResponse(res, 200, 'Customers fetched successfully', customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return errorResponse(res, 404, 'Customer not found');

    // Get purchase history
    const purchases = await Sale.find({ customer: req.params.id }).sort({ saleDate: -1 });
    successResponse(res, 200, 'Customer fetched successfully', { customer, purchases });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return errorResponse(res, 404, 'Customer not found');
    successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return errorResponse(res, 404, 'Customer not found');
    successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};
