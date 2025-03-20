import express from 'express';
import multer from 'multer';
import { submitReport, getReports, getReportById, deleteReport } from '../controllers/reportController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route to submit a report (with image upload)
router.post('/', upload.array('images'), submitReport);

// Route to get all reports
router.get('/', getReports);

// Route to get a single report by ID
router.get('/:id', getReportById);

// Route to delete a report by ID
router.delete('/:id', deleteReport);

export default router;
