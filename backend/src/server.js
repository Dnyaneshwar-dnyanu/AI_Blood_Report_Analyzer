import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import reportRouter from './routes/report.route.js';
import chatRouter from './routes/chat.route.js';
import authRouter from './routes/auth.route.js';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';
import ingestKnowledgeBase from './services/rag/rag.service.js';

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/report', reportRouter);
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'Blood Report Analyzer API active' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Database Connection & Server Startup
const startServer = async () => {
    await connectDB();
    
    // Automatically check and ingest knowledge base if needed
    try {
        await ingestKnowledgeBase(false);
    } catch (err) {
        console.warn("Knowledge Base Auto-Ingestion skipped or failed:", err.message);
    }

    if (process.env.NODE_ENV !== 'test') {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
};

startServer();

export default app;