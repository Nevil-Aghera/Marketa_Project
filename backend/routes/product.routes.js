import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(protect, isApproved);

router.route('/').get(getProducts).post(upload.single('image'), createProduct);
router.route('/:id').get(getProduct).put(upload.single('image'), updateProduct).delete(deleteProduct);

export default router;
