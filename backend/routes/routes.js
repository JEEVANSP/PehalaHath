import express from 'express';
import loginRoutes from './auth/loginroutes.js';
import registerRoutes from './auth/registerroutes.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDashboardData } from '../controllers/auth/dashboardController.js';

const router = express.Router();

// Use Authentication Routes
router.use('/auth', loginRoutes);
router.use('/auth', registerRoutes);
router.use('/auth', authMiddleware, getDashboardData);

export default router;
