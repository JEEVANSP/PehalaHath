import express from 'express';
import multer from 'multer';
import authMiddleware from '../../middleware/authMiddleware.js';
import { submitReport, getReports, getReportById, deleteReport } from '../../controllers/auth/reportController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route to submit a report (with image upload)
router.post('/submit-report', upload.array('images'), authMiddleware, submitReport);

// Route to get all reports
router.get('/get-report', getReports);

// Route to get a single report by ID
router.get('/:id', getReportById);

// Route to delete a report by ID
router.delete('/:id', deleteReport);

export default router;
