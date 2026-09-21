import express from "express";
import { getResponseForQuery, getChatHistory } from "../controllers/chat.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/query', optionalAuth, getResponseForQuery);
router.get('/history/:reportId', optionalAuth, getChatHistory);

export default router;