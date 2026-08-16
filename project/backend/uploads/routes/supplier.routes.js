import express from 'express';
import { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplier.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.route('/').get(getSuppliers).post(createSupplier);
router.route('/:id').get(getSupplier).put(updateSupplier).delete(deleteSupplier);
export default router;
