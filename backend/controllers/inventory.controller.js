import Product from '../models/Product.model.js';
import StockHistory from '../models/StockHistory.model.js';
import Notification from '../models/Notification.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc   Get inventory overview
// @route  GET /api/inventory
export const getInventory = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (status === 'low') filter.isLowStock = true;
    if (status === 'out') filter.isOutOfStock = true;

    const products = await Product.find(filter).populate('category', 'name').sort({ stock: 1 });
    successResponse(res, 200, 'Inventory fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

// @desc   Manual stock adjustment
// @route  POST /api/inventory/adjust
export const adjustStock = async (req, res, next) => {
  try {
    const { productId, quantity, type, reason, notes } = req.body;
    // type: 'in' | 'out'
    // reason: 'damaged' | 'expired' | 'lost' | 'manual_correction'

    const product = await Product.findById(productId);
    if (!product) return errorResponse(res, 404, 'Product not found');

    const previousStock = product.stock;
    if (type === 'out' && product.stock < quantity) {
      return errorResponse(res, 400, `Insufficient stock. Available: ${product.stock}`);
    }

    if (type === 'in') product.stock += quantity;
    else product.stock -= quantity;

    await product.save();

    await StockHistory.create({
      product: product._id,
      productName: product.name,
      type: 'adjustment',
      quantity,
      previousStock,
      newStock: product.stock,
      reason,
      notes,
    });

    // Check stock alerts
    if (product.stock === 0) {
      await Notification.create({
        message: `⚠️ ${product.name} is OUT OF STOCK!`,
        type: 'out_of_stock',
        product: product._id,
        productName: product.name,
      });
    } else if (product.isLowStock) {
      await Notification.create({
        message: `⚠️ Low Stock: ${product.name} has ${product.stock} left.`,
        type: 'low_stock',
        product: product._id,
        productName: product.name,
      });
    }

    successResponse(res, 200, 'Stock adjusted successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc   Get stock history
// @route  GET /api/inventory/history
export const getStockHistory = async (req, res, next) => {
  try {
    const { productId, limit = 50 } = req.query;
    const filter = {};
    if (productId) filter.product = productId;

    const history = await StockHistory.find(filter)
      .populate('product', 'name unit')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    successResponse(res, 200, 'Stock history fetched successfully', history);
  } catch (error) {
    next(error);
  }
};
