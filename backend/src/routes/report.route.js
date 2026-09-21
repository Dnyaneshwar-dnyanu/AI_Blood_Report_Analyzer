import express from 'express';
import upload from '../config/multer.js';
import { uploadReport, getReport, getReportGuidance, getUserReports } from '../controllers/report.controller.js';
import { optionalAuth, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/user/all', protect, getUserReports);
router.get('/:id/guidance', optionalAuth, getReportGuidance);
router.get('/:id', optionalAuth, getReport);
router.post('/upload', optionalAuth, upload.single("file"), uploadReport);

export default router;