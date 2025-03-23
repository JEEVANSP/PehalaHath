import express from 'express';
import loginRoutes from './auth/loginroutes.js';
import registerRoutes from './auth/registerroutes.js';
import getDashboardData from './auth/dashboardroutes.js';
import reports from './auth/reportroutes.js'
import resourceRoutes from './resourceRoutes.js'

const router = express.Router();

// Use Authentication Routes
router.use('/auth', loginRoutes);
router.use('/auth', registerRoutes);
router.use('/auth',getDashboardData);
router.use('/auth/reports', reports);
router.use('/', resourceRoutes);

export default router;
