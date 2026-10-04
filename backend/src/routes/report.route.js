import express from 'express';
import upload from '../config/multer.js';
import { 
    uploadReport, 
    getReport, 
    getReportGuidance, 
    getUserReports,
    updateReport,
    deleteReport,
    getBatchReports,
    compareReportsController,
    getComparisonInsightsController
} from '../controllers/report.controller.js';
import { optionalAuth, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/user/all', protect, getUserReports);
router.post('/batch', optionalAuth, getBatchReports);
router.post('/compare', optionalAuth, compareReportsController);
router.post('/compare/insights', optionalAuth, getComparisonInsightsController);
router.get('/:id/guidance', optionalAuth, getReportGuidance);
router.get('/:id', optionalAuth, getReport);
router.put('/:id', optionalAuth, updateReport);
router.delete('/:id', optionalAuth, deleteReport);
router.post('/upload', optionalAuth, upload.single("file"), uploadReport);

export default router;