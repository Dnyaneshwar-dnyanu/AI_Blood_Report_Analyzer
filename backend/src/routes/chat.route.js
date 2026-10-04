import express from "express";
import { getResponseForQuery, getChatHistory, explainTerm } from "../controllers/chat.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/query', optionalAuth, getResponseForQuery);
router.get('/history/:reportId', optionalAuth, getChatHistory);
router.get('/explain/:term', optionalAuth, explainTerm);
router.post('/explain', optionalAuth, explainTerm);

export default router;