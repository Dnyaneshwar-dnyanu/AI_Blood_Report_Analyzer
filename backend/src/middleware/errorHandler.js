/**
 * Centralized Error Handling Middleware
 * 
 * - Logs complete error context and stack traces to server logs.
 * - Masks internal/sensitive errors before responding to the client.
 * - Prevents raw exceptions, API keys, and stack traces from reaching the frontend.
 */

export function errorHandler(err, req, res, next) {
    // 1. Detailed server-side logging
    console.error(`[ServerError] ${req.method} ${req.originalUrl}:`, {
        name: err.name,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });

    // 2. Default status code and generic message
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let safeMessage = "An unexpected error occurred. Please try again shortly.";
    let errorCode = "INTERNAL_SERVER_ERROR";

    // 3. Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 404;
        safeMessage = "The requested report or resource could not be found.";
        errorCode = "RESOURCE_NOT_FOUND";
    }

    // 4. Handle Mongoose ValidationError
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        safeMessage = "Invalid data provided. Please verify the report fields.";
        errorCode = "VALIDATION_ERROR";
    }

    // 5. Handle AI Rate Limiting / Quota Exhaustion
    else if (err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota'))) {
        statusCode = 503;
        safeMessage = "Our AI health assistant is receiving high request volume right now. Please wait a moment and try again.";
        errorCode = "AI_SERVICE_BUSY";
    }

    // 6. Handle JWT / Auth Errors
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        safeMessage = "Your session has expired. Please sign in again.";
        errorCode = "AUTH_EXPIRED";
    }

    // 7. Handle Multer Upload Errors
    else if (err.name === 'MulterError') {
        statusCode = 400;
        safeMessage = err.code === 'LIMIT_FILE_SIZE' 
            ? "The uploaded file is too large. Maximum file size is 10 MB."
            : "File upload failed. Please verify your file format.";
        errorCode = "UPLOAD_ERROR";
    }

    // 8. Custom client error messages if set with 4xx status
    else if (statusCode >= 400 && statusCode < 500 && err.message) {
        // Only pass message if it doesn't contain sensitive tokens
        const sensitiveTerms = ['key', 'mongo', 'token', 'secret', 'password', 'gemini'];
        const hasSensitiveTerm = sensitiveTerms.some(t => err.message.toLowerCase().includes(t));
        if (!hasSensitiveTerm) {
            safeMessage = err.message;
        }
    }

    // Return sanitized JSON response to client
    return res.status(statusCode).json({
        success: false,
        message: safeMessage,
        code: errorCode
    });
}

export default errorHandler;
