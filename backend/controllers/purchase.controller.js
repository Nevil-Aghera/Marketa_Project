import Purchase from '../models/Purchase.model.js';
import Product from '../models/Product.model.js';
import StockHistory from '../models/StockHistory.model.js';
import Notification from '../models/Notification.model.js';
import { generatePurchaseInvoiceNumber } from '../utils/generateInvoiceNumber.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper: Check and create stock notification
const checkStockAlert = async (product) => {
  if (product.stock === 0) {
    await Notification.create({
      message: `⚠️ ${product.name} is OUT OF STOCK! Please restock immediately.`,
      type: 'out_of_stock',
      product: product._id,
      productName: product.name,
    });
  } else if (product.isLowStock) {
    await Notification.create({
      message: `⚠️ Low Stock Alert: ${product.name} has only ${product.stock} ${product.unit}(s) left. Minimum is ${product.minStock}.`,
      type: 'low_stock',
      product: product._id,
      productName: product.name,
    });
  }
};

// @desc   Get all purchases
// @route  GET /api/purchases
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find().populate('supplier', 'name company').sort({ createdAt: -1 });
    successResponse(res, 200, 'Purchases fetched successfully', purchases);
  } catch (error) {
    next(error);
  }
};

// @desc   Get single purchase
// @route  GET /api/purchases/:id
export const getPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('supplier', 'name company phone email address gstNumber').populate('items.product', 'name unit');
    if (!purchase) return errorResponse(res, 404, 'Purchase not found');
    successResponse(res, 200, 'Purchase fetched successfully', purchase);
  } catch (error) {
    next(error);
  }
};

// @desc   Create purchase (auto update stock)
// @route  POST /api/purchases
export const createPurchase = async (req, res, next) => {
  try {
    const { supplier, items, notes, purchaseDate } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, 400, 'Purchase must have at least one item');
    }

    // Calculate totals
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return errorResponse(res, 404, `Product not found: ${item.product}`);

      const itemTotal = item.quantity * item.purchasePrice;
      totalAmount += itemTotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        totalPrice: itemTotal,
      });
    }

    const invoiceNumber = await generatePurchaseInvoiceNumber();

    // Create purchase
    const purchase = await Purchase.create({
      invoiceNumber,
      supplier,
      items: processedItems,
      totalAmount,
      notes,
      purchaseDate: purchaseDate || Date.now(),
    });

    // Update stock and create history
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      product.stock += item.quantity;
      await product.save();

      await StockHistory.create({
        product: product._id,
        productName: product.name,
        type: 'in',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reason: 'purchase',
        reference: invoiceNumber,
        notes: `Purchase invoice: ${invoiceNumber}`,
      });

      await checkStockAlert(product);
    }

    const populated = await Purchase.findById(purchase._id).populate('supplier', 'name company');
    successResponse(res, 201, 'Purchase created successfully', populated);
  } catch (error) {
    next(error);
  }
};
