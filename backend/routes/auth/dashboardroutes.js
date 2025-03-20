import express from 'express';
import authMiddleware from '../../middleware/authMiddleware';
import { dashboard } from '../../controllers/auth/dashboardController';

const router = express.Router();

router.get('/dashboard', authMiddleware,dashboard);

export default router;
