import express from 'express';
import { getInventory, adjustStock, getStockHistory } from '../controllers/inventory.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.get('/', getInventory);
router.post('/adjust', adjustStock);
router.get('/history', getStockHistory);
export default router;
