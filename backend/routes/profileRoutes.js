import express from 'express';
import { getUserProfile,updateUserProfile,changePassword } from '../controllers/auth/ProfileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile',authMiddleware,getUserProfile);
router.put('/profile',authMiddleware,updateUserProfile);
router.put('/change-password',authMiddleware,changePassword);

export default router;