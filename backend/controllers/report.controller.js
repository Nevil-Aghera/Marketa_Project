import Sale from '../models/Sale.model.js';
import Purchase from '../models/Purchase.model.js';
import Product from '../models/Product.model.js';
import Customer from '../models/Customer.model.js';
import { successResponse } from '../utils/apiResponse.js';

// @desc   Sales report
// @route  GET /api/reports/sales
export const getSalesReport = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy;

    if (period === 'daily') {
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    } else if (period === 'weekly') {
      groupBy = { $week: '$saleDate' };
    } else {
      groupBy = { $dateToString: { format: '%Y-%m', date: '$saleDate' } };
    }

    const salesData = await Sale.aggregate([
      { $group: { _id: groupBy, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.totalPrice' } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const paymentMethods = await Sale.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]);

    successResponse(res, 200, 'Sales report fetched', { salesData, topProducts, paymentMethods });
  } catch (error) {
    next(error);
  }
};

// @desc   Purchase report
// @route  GET /api/reports/purchases
export const getPurchaseReport = async (req, res, next) => {
  try {
    const purchaseData = await Purchase.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$purchaseDate' } }, totalPurchases: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const topSuppliers = await Purchase.aggregate([
      { $group: { _id: '$supplier', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: '$supplier' },
    ]);

    successResponse(res, 200, 'Purchase report fetched', { purchaseData, topSuppliers });
  } catch (error) {
    next(error);
  }
};

// @desc   Inventory report
// @route  GET /api/reports/inventory
export const getInventoryReport = async (req, res, next) => {
  try {
    const totalStock = await Product.aggregate([{ $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$sellingPrice'] } }, totalItems: { $sum: '$stock' } } }]);
    const lowStock = await Product.find({ isLowStock: true }).populate('category', 'name').select('name stock minStock unit category');
    const outOfStock = await Product.find({ isOutOfStock: true }).populate('category', 'name').select('name stock minStock unit category');
    const categoryWise = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
    ]);

    successResponse(res, 200, 'Inventory report fetched', { totalStock: totalStock[0], lowStock, outOfStock, categoryWise });
  } catch (error) {
    next(error);
  }
};

// @desc   Customer report
// @route  GET /api/reports/customers
export const getCustomerReport = async (req, res, next) => {
  try {
    const topCustomers = await Customer.find().sort({ totalSpent: -1 }).limit(10);
    successResponse(res, 200, 'Customer report fetched', topCustomers);
  } catch (error) {
    next(error);
  }
};
