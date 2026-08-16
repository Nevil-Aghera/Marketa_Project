import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, isApproved);

router.route('/').get(getCategories).post(createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

export default router;
