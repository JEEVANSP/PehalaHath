import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import  dashboard from '../../controllers/auth/dashboardController.js';

const router = express.Router();

router.get('/dashboard', authMiddleware,dashboard);

export default router;
