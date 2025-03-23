import express from 'express';
import {
  getAllResources,
  createResourceRequest,
  updateResourceStatus,
  getUserResourceRequests
} from '../controllers/auth/resourceController.js';

const router = express.Router();

// Get all resources
router.get('/resources', getAllResources);

// Create a new resource request
router.post('/resources', createResourceRequest);

// Update resource status
router.patch('/resources/:id', updateResourceStatus);

// Get user's resource requests
router.get('/resources/user/:userId', getUserResourceRequests);

export default router; 