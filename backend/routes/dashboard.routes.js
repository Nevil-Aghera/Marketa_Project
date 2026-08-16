import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, isApproved, getDashboardStats);

export default router;
