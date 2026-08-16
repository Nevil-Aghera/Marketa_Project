import express from 'express';
import { getPurchases, getPurchase, createPurchase } from '../controllers/purchase.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.route('/').get(getPurchases).post(createPurchase);
router.route('/:id').get(getPurchase);
export default router;
