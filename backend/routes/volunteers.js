import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

import { getTasks,createTask,assignVolunteer,completeTask,getStats } from '../controllers/auth/volunteerController.js';

const router = express.Router();

// Get all tasks
router.get('/tasks', getTasks);

// Create a new task (only for authorities)
router.post('/tasks', authMiddleware, createTask);

// Volunteer for a task
router.post('/assign', authMiddleware, assignVolunteer);

// Complete a task
router.post('/complete', authMiddleware, completeTask);

// Get volunteer statistics
router.get('/stats', getStats);

export default router;