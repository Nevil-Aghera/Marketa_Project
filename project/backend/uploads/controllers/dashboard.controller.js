import Product from '../models/Product.model.js';
import Sale from '../models/Sale.model.js';
import Purchase from '../models/Purchase.model.js';
import Customer from '../models/Customer.model.js';
import Category from '../models/Category.model.js';
import Supplier from '../models/Supplier.model.js';
import Notification from '../models/Notification.model.js';
import { successResponse } from '../utils/apiResponse.js';

// @desc   Get dashboard stats
// @route  GET /api/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Counts
    const [totalProducts, totalCategories, totalSuppliers, totalCustomers] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Supplier.countDocuments(),
      Customer.countDocuments(),
    ]);

    // Sales aggregation
    const totalSalesAgg = await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]);
    const todaySalesAgg = await Sale.aggregate([
      { $match: { saleDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const monthlySalesAgg = await Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Purchases aggregation
    const totalPurchasesAgg = await Purchase.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]);
    const todayPurchasesAgg = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const monthlyPurchasesAgg = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Stock alerts
    const lowStockProducts = await Product.find({ isLowStock: true }).populate('category', 'name').limit(10);
    const outOfStockProducts = await Product.find({ isOutOfStock: true }).populate('category', 'name').limit(10);

    // Recent data
    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name');
    const recentPurchases = await Purchase.find().sort({ createdAt: -1 }).limit(5).populate('supplier', 'name');

    // Unread notifications count
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    const totalIncome = totalSalesAgg[0]?.total || 0;
    const totalExpenses = totalPurchasesAgg[0]?.total || 0;
    const totalProfit = totalIncome - totalExpenses;

    successResponse(res, 200, 'Dashboard stats fetched', {
      counts: { totalProducts, totalCategories, totalSuppliers, totalCustomers },
      sales: {
        totalCount: totalSalesAgg[0]?.count || 0,
        totalAmount: totalIncome,
        todayAmount: todaySalesAgg[0]?.total || 0,
        monthlyAmount: monthlySalesAgg[0]?.total || 0,
      },
      purchases: {
        totalCount: totalPurchasesAgg[0]?.count || 0,
        totalAmount: totalExpenses,
        todayAmount: todayPurchasesAgg[0]?.total || 0,
        monthlyAmount: monthlyPurchasesAgg[0]?.total || 0,
      },
      financials: { totalIncome, totalExpenses, totalProfit },
      stockAlerts: { lowStockProducts, outOfStockProducts },
      recentActivity: { recentSales, recentPurchases },
      unreadNotifications,
    });
  } catch (error) {
    next(error);
  }
};
