import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import { submitReport, getReports, getReportById, deleteReport } from '../../controllers/auth/reportController.js';
import multer from 'multer';

const router = express.Router();

// We need to add multer back for parsing multipart form data, but configure it for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Route to submit a report (with image upload)
router.post('/submit-report', authMiddleware, upload.array('images'), submitReport);

// Route to get all reports
router.get('/get-report', getReports);

// Route to get a single report by ID
router.get('/:id', getReportById);

// Route to delete a report by ID
router.delete('/:id', deleteReport);

export default router;
