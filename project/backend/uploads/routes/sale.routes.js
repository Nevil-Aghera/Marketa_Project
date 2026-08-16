import express from 'express';
import { getSales, getSale, createSale } from '../controllers/sale.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale);
export default router;
