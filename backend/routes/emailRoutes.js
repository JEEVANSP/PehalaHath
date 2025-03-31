import express from 'express';
import { sendTestEmail } from '../controllers/auth/emailController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/test-email',authMiddleware,sendTestEmail);

export default router;