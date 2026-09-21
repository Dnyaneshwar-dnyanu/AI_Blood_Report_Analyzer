import ai from "../../config/llm.js";
import { Type } from "@google/genai";

export async function analyzeBloodReport(reportText) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    try {
        console.log(`Analyzing blood report with Gemini model: ${modelName}...`);
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `Analyze this blood report text and extract patient details, generate an AI summary, and extract all biomarkers with their reference ranges and status: \n\n ${reportText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        patientDetails: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                age: { type: Type.STRING },
                                gender: { type: Type.STRING },
                                reportDate: { type: Type.STRING }
                            },
                            required: ["name", "age", "gender", "reportDate"]
                        },
                        aiSummary: {
                            type: Type.STRING
                        },
                        biomarkers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                    unit: { type: Type.STRING },
                                    range: {
                                        type: Type.OBJECT,
                                        properties: {
                                            min: { type: Type.STRING },
                                            max: { type: Type.STRING },
                                            rawText: { type: Type.STRING }
                                        },
                                        required: ["min", "max"]
                                    },
                                    status: { type: Type.STRING, enum: ["Normal", "High", "Low"] },
                                    comparisonText: { type: Type.STRING }
                                },
                                required: ["name", "value", "unit", "range", "status"]
                            }
                        }
                    },
                    required: ["patientDetails", "aiSummary", "biomarkers"]
                }
            }
        });

        if (!response || !response.text) {
            throw new Error("Empty response received from Gemini AI");
        }

        const parsed = JSON.parse(response.text);
        
        // Normalize numeric values if possible, while keeping string representation
        if (parsed.biomarkers && Array.isArray(parsed.biomarkers)) {
            parsed.biomarkers = parsed.biomarkers.map(b => {
                const numVal = parseFloat(b.value);
                const numMin = parseFloat(b.range?.min);
                const numMax = parseFloat(b.range?.max);

                return {
                    ...b,
                    value: isNaN(numVal) ? (b.value || "—") : numVal,
                    range: {
                        min: isNaN(numMin) ? (b.range?.min || "—") : numMin,
                        max: isNaN(numMax) ? (b.range?.max || "—") : numMax,
                        rawText: b.range?.rawText || `${b.range?.min || ''} - ${b.range?.max || ''}`
                    },
                    comparisonText: b.comparisonText || `Compared with reference range ${b.range?.min || ''}-${b.range?.max || ''}`
                };
            });
        }

        return parsed;

    } catch (error) {
        console.error("Gemini Analysis Error:", error.message);
        // Return a robust fallback structure rather than failing completely
        return {
            patientDetails: {
                name: "Unspecified Patient",
                age: "—",
                gender: "—",
                reportDate: new Date().toLocaleDateString()
            },
            aiSummary: "The report text was extracted, but automatic AI structured analysis encountered an issue. Please review raw report values with your physician.",
            biomarkers: [
                {
                    name: "Report Processing Alert",
                    value: "Parsed with Warnings",
                    unit: "",
                    range: { min: "-", max: "-", rawText: "N/A" },
                    status: "Normal",
                    comparisonText: "Manual verification recommended"
                }
            ]
        };
    }
}

export default analyzeBloodReport;