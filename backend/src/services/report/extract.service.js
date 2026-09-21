import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import scribe from 'scribe.js-ocr';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function extractText(file) {
    try {
        const ext = path.extname(file.originalname || file.path || '').toLowerCase();
        
        // 1. If PDF file, try fast native text extraction with pdf-parse first
        if (ext === '.pdf') {
            try {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdfParse(dataBuffer);
                
                if (pdfData && pdfData.text && pdfData.text.trim().length > 50) {
                    console.log(`Successfully extracted text via pdf-parse (${pdfData.text.trim().length} chars)`);
                    return pdfData.text.trim();
                }
                console.log("PDF contains minimal native text, falling back to OCR...");
            } catch (pdfErr) {
                console.warn("pdf-parse extraction failed, attempting OCR fallback:", pdfErr.message);
            }
        }

        // 2. Fallback to scribe.js-ocr for scanned PDFs and image files (PNG/JPG)
        console.log("Running OCR extraction using scribe.js-ocr...");
        const text = await scribe.extractText([file.path]);
        return text || "";

    } catch (error) {
        console.error("Text Extraction Error:", error.message);
        throw new Error("Failed to extract text from file: " + error.message);
    } finally {
        try {
            await scribe.terminate();
        } catch (e) {
            // Ignore scribe cleanup errors
        }
    }
}

export default extractText;