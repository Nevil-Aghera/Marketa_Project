import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect, isApproved } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();
router.use(protect, isApproved);
router.get('/', getSettings);
router.put('/', upload.single('logo'), updateSettings);
export default router;
