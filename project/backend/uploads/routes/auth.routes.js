import express from 'express';
import { register, login, getMe, getPendingManagers, approveManager } from '../controllers/auth.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/pending', protect, isAdmin, getPendingManagers);
router.patch('/approve/:id', protect, isAdmin, approveManager);

export default router;
