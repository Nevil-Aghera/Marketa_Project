import Sale from '../models/Sale.model.js';
import Product from '../models/Product.model.js';
import Customer from '../models/Customer.model.js';
import StockHistory from '../models/StockHistory.model.js';
import Notification from '../models/Notification.model.js';
import { generateSaleInvoiceNumber } from '../utils/generateInvoiceNumber.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

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

// @desc   Get all sales
// @route  GET /api/sales
export const getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const sales = await Sale.find(filter).populate('customer', 'name mobile').sort({ createdAt: -1 });
    successResponse(res, 200, 'Sales fetched successfully', sales);
  } catch (error) {
    next(error);
  }
};

// @desc   Get single sale
// @route  GET /api/sales/:id
export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer', 'name mobile address').populate('items.product', 'name unit');
    if (!sale) return errorResponse(res, 404, 'Sale not found');
    successResponse(res, 200, 'Sale fetched successfully', sale);
  } catch (error) {
    next(error);
  }
};

// @desc   Create sale (auto reduce stock)
// @route  POST /api/sales
export const createSale = async (req, res, next) => {
  try {
    const { customer, customerName, items, discount = 0, paymentMethod, notes, saleDate } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, 400, 'Sale must have at least one item');
    }

    // Validate stock availability
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return errorResponse(res, 404, `Product not found: ${item.product}`);
      if (product.stock < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const itemTotal = item.quantity * item.sellingPrice;
      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        totalPrice: itemTotal,
      });
    }

    const totalAmount = subtotal - discount;
    const invoiceNumber = await generateSaleInvoiceNumber();

    // Resolve customer name
    let resolvedCustomerName = customerName || 'Walk-in Customer';
    if (customer) {
      const cust = await Customer.findById(customer);
      if (cust) resolvedCustomerName = cust.name;
    }

    const sale = await Sale.create({
      invoiceNumber,
      customer: customer || null,
      customerName: resolvedCustomerName,
      items: processedItems,
      subtotal,
      discount,
      totalAmount,
      paymentMethod,
      notes,
      saleDate: saleDate || Date.now(),
    });

    // Update stock, history and customer stats
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await StockHistory.create({
        product: product._id,
        productName: product.name,
        type: 'out',
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        reason: 'sale',
        reference: invoiceNumber,
        notes: `Sale invoice: ${invoiceNumber}`,
      });

      await checkStockAlert(product);
    }

    // Update customer stats
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalPurchases: 1, totalSpent: totalAmount },
      });
    }

    const populated = await Sale.findById(sale._id).populate('customer', 'name mobile');
    successResponse(res, 201, 'Sale created successfully', populated);
  } catch (error) {
    next(error);
  }
};
