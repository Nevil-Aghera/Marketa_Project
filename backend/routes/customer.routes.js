import express from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);
export default router;
