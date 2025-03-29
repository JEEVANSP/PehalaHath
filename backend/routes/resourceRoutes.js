import express from 'express';
import {
  getAllResources,
  createResourceRequest,
  updateResourceStatus,
  getUserResourceRequests,
  updateResourceAllocation,
  deleteAllocatedResource
} from '../controllers/auth/resourceController.js';

const router = express.Router();

// Get all resources
router.get('/resources', getAllResources);

// Create a new resource request
router.post('/resources', createResourceRequest);

// Update resource status
router.patch('/resources/:id', updateResourceStatus);

// Mark resource as allocated
router.patch('/resources/:userId/:resourceId/allocate', updateResourceAllocation);

// Get user's resource requests
router.get('/resources/user/:userId', getUserResourceRequests);

router.delete('/resources/:userId/:resourceId',deleteAllocatedResource)

export default router;