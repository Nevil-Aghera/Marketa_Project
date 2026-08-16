import express from 'express';
import { getSalesReport, getPurchaseReport, getInventoryReport, getCustomerReport } from '../controllers/report.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.get('/sales', getSalesReport);
router.get('/purchases', getPurchaseReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);
export default router;
