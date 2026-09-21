import analyzeBloodReport from "./analyzeReport.service.js";
import extractText from "./extract.service.js";

async function processReport(file) {
    try {
        // 1. Validate file
        if (!file) {
            throw new Error("No file provided");
        }

        console.log("Processing: ", file.originalname);

        // 2. Extract the text from the file
        const rawText = await extractText(file);
        
        if(!rawText || rawText.trim().length === 0) {
            throw new Error("Could not extract text from the report");
        }

        console.log("Text extracted successfully");

        // 3. Extract Biomarker data
        const reportData = await analyzeBloodReport(rawText);

        return reportData;

    } catch (error) {
        console.error("Report processing failed:", error.message);
        throw error;
    }

}

export default processReport;