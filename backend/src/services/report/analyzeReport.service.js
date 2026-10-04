import ai from "../../config/llm.js";
import { Type } from "@google/genai";

export function getNormalizedBiomarkerKey(name = "") {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    if (clean.includes('hemoglobin') || clean === 'hb') return 'hemoglobin';
    if (clean.includes('rbc') || clean.includes('red blood cell')) return 'rbc';
    if (clean.includes('wbc') || clean.includes('white blood cell')) return 'wbc';
    if (clean.includes('platelet')) return 'platelets';
    if (clean.includes('hematocrit') || clean.includes('pcv')) return 'hematocrit';
    if (clean.includes('fasting') && (clean.includes('glucose') || clean.includes('sugar'))) return 'glucose_fasting';
    if (clean.includes('post prandial') || clean.includes('ppbs')) return 'glucose_pp';
    if (clean.includes('hba1c') || clean.includes('glycated')) return 'hba1c';
    if (clean.includes('glucose') || clean.includes('sugar')) return 'glucose';
    if (clean.includes('total cholesterol') || clean === 'cholesterol') return 'cholesterol_total';
    if (clean.includes('triglyceride')) return 'triglycerides';
    if (clean.includes('hdl')) return 'hdl';
    if (clean.includes('ldl')) return 'ldl';
    if (clean.includes('vldl')) return 'vldl';
    if (clean.includes('vitamin d') || clean.includes('d3')) return 'vitamin_d';
    if (clean.includes('vitamin b12') || clean.includes('b12')) return 'vitamin_b12';
    if (clean.includes('creatinine')) return 'creatinine';
    if (clean.includes('urea') || clean.includes('bun')) return 'urea';
    if (clean.includes('egfr')) return 'egfr';
    if (clean.includes('alt') || clean.includes('sgpt')) return 'alt_sgpt';
    if (clean.includes('ast') || clean.includes('sgot')) return 'ast_sgot';
    if (clean.includes('bilirubin')) return 'bilirubin';
    if (clean.includes('alkaline phosphatase') || clean.includes('alp')) return 'alp';
    if (clean.includes('tsh')) return 'tsh';
    if (clean.includes('t3')) return 't3';
    if (clean.includes('t4')) return 't4';
    return clean.replace(/\s+/g, '_');
}

export function inferCategory(name = "") {
    const key = name.toLowerCase();
    if (key.match(/hemoglobin|wbc|rbc|platelet|hematocrit|mcv|mch|neutrophil|lymphocyte|eosinophil|monocyte|basophil/)) return 'CBC';
    if (key.match(/cholesterol|triglyceride|hdl|ldl|vldl|lipid/)) return 'Lipids';
    if (key.match(/glucose|sugar|hba1c|insulin/)) return 'Metabolic';
    if (key.match(/creatinine|urea|bun|egfr|uric acid|kidney/)) return 'Kidney';
    if (key.match(/alt|ast|sgpt|sgot|bilirubin|alp|albumin|globulin|liver/)) return 'Liver';
    if (key.match(/tsh|t3|t4|thyroid/)) return 'Thyroid';
    if (key.match(/vitamin|b12|d3|folate|iron|ferritin|calcium|electrolytes|sodium|potassium/)) return 'Vitamins';
    return 'Other';
}

export async function analyzeBloodReport(reportText) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    try {
        console.log(`Analyzing blood report with Gemini model: ${modelName}...`);
        
        let response;
        const modelsToAttempt = [modelName, 'gemini-3.5-flash-lite'];

        for (const candidateModel of modelsToAttempt) {
            try {
                response = await ai.models.generateContent({
                    model: candidateModel,
                    contents: `Analyze this blood report text. Extract patient details, generate an empathetic AI summary, and extract all biomarkers.
For each biomarker, determine:
- category: one of ["CBC", "Lipids", "Metabolic", "Kidney", "Liver", "Thyroid", "Vitamins", "Other"]
- reference range min and max (or discrete text)
- status: "Normal", "High", or "Low" relative to the reference range
- confidence: "high", "medium", or "low"
- uncertainFlag: boolean. Set to true if the text was blurry/unclear, if the range was missing or ambiguous, if the unit was unclear, or if value extraction was uncertain.
- uncertaintyReason: string explaining why this extraction is marked uncertain (or empty string if confident).

Blood Report Text:
${reportText}`,
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
                                            category: { type: Type.STRING },
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
                                            confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
                                            uncertainFlag: { type: Type.BOOLEAN },
                                            uncertaintyReason: { type: Type.STRING },
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
                if (response && response.text) break;
            } catch (modelErr) {
                const isTransient = modelErr.message && (
                    modelErr.message.includes('503') || 
                    modelErr.message.includes('high demand') ||
                    modelErr.message.includes('429') ||
                    modelErr.message.includes('RESOURCE_EXHAUSTED')
                );
                if (isTransient && candidateModel === modelName) {
                    console.warn(`[Gemini] ${candidateModel} is experiencing temporary high demand (503). Retrying with fallback model...`);
                    await new Promise(r => setTimeout(r, 1200));
                    continue;
                }
                throw modelErr;
            }
        }

        if (!response || !response.text) {
            throw new Error("Empty response received from Gemini AI");
        }

        const parsed = JSON.parse(response.text);
        
        // Normalize values, compute deterministic status, and ensure flags
        if (parsed.biomarkers && Array.isArray(parsed.biomarkers)) {
            parsed.biomarkers = parsed.biomarkers.map(b => {
                const numVal = parseFloat(b.value);
                const numMin = parseFloat(b.range?.min);
                const numMax = parseFloat(b.range?.max);

                const hasValidNumeric = !isNaN(numVal) && !isNaN(numMin) && !isNaN(numMax);
                let computedStatus = b.status || "Normal";
                
                if (hasValidNumeric) {
                    if (numVal < numMin) computedStatus = "Low";
                    else if (numVal > numMax) computedStatus = "High";
                    else computedStatus = "Normal";
                }

                // Auto-detect uncertainty if missing range or weird numbers
                const isUncertain = b.uncertainFlag === true || !b.range || (!hasValidNumeric && isNaN(numVal));
                const reason = b.uncertaintyReason || (isUncertain ? "Non-standard numeric format or missing reference range" : "");

                const category = (b.category && b.category !== "Other") ? b.category : inferCategory(b.name);
                const normalizedKey = getNormalizedBiomarkerKey(b.name);

                return {
                    ...b,
                    normalizedKey,
                    category,
                    value: isNaN(numVal) ? (b.value || "—") : numVal,
                    range: {
                        min: isNaN(numMin) ? (b.range?.min || "—") : numMin,
                        max: isNaN(numMax) ? (b.range?.max || "—") : numMax,
                        rawText: b.range?.rawText || `${b.range?.min || ''} - ${b.range?.max || ''}`
                    },
                    status: computedStatus,
                    confidence: b.confidence || (isUncertain ? "medium" : "high"),
                    uncertainFlag: isUncertain,
                    uncertaintyReason: reason,
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