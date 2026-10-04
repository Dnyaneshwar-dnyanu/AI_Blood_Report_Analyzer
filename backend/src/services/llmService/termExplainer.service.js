import path from 'path';
import retrieveContext from "../rag/retrieval.service.js";
import ai from "../../config/llm.js";
import { Type } from "@google/genai";

export async function explainBiomarker(term) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    try {
        if (!term || term.trim().length === 0) {
            throw new Error("Biomarker term is required.");
        }

        // 1. Retrieve RAG vector context for the term
        const context = await retrieveContext(term.trim(), 4);

        const sources = (context || []).map(item => ({
            source: item.source,
            category: item.category || 'General Medical Reference',
            fileName: path.basename(item.source || 'Medical Guide'),
            snippet: (item.chunk || '').substring(0, 160) + '...'
        }));

        const contextText = (context && context.length > 0)
            ? context.map((item, index) => `SOURCE ${index + 1} [${path.basename(item.source || '')} - Category: ${item.category || 'General'}]:\n${item.chunk}`).join("\n\n")
            : "No specific medical reference documents matched this exact query.";

        const prompt = `
You are a warm, knowledgeable medical educator helping patients understand laboratory terms in plain, reassuring English.
Explain the following biomarker or medical term: "${term}".

GROUNDING MEDICAL KNOWLEDGE (RAG CONTEXT):
${contextText}

REQUIREMENTS:
1. Tone: Empathetic, clear, educational. Avoid clinical jargon.
2. Structure JSON with:
   - summary: A clear 2-3 sentence overview of what this biomarker is.
   - functionInBody: What this biomarker does in the body.
   - highFactors: 2-3 common everyday or physiological factors that may cause high levels (e.g. dehydration, intense exercise, diet). Do NOT make definitive disease diagnoses.
   - lowFactors: 2-3 common everyday or physiological factors that may cause low levels (e.g. nutritional gaps, fatigue).
   - supportiveHabits: 2-3 non-prescriptive, evidence-grounded everyday habits (nutrition, hydration, sleep, light activity).
   - doctorQuestions: 2-3 friendly questions the patient can ask their healthcare provider.
3. Strict Safety: No medication dosages, no definitive disease labeling. General educational wellness awareness only.
`;

        let response;
        const modelsToAttempt = [modelName, 'gemini-3.5-flash-lite'];

        for (const candidateModel of modelsToAttempt) {
            try {
                response = await ai.models.generateContent({
                    model: candidateModel,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                functionInBody: { type: Type.STRING },
                                highFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                                lowFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                                supportiveHabits: { type: Type.ARRAY, items: { type: Type.STRING } },
                                doctorQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["summary", "functionInBody", "highFactors", "lowFactors", "supportiveHabits", "doctorQuestions"]
                        }
                    }
                });
                if (response && response.text) break;
            } catch (err) {
                const isTransient = err.message && (
                    err.message.includes('503') || 
                    err.message.includes('high demand') ||
                    err.message.includes('429')
                );
                if (isTransient && candidateModel === modelName) {
                    console.warn(`[Gemini] High demand on ${candidateModel}, failing over to gemini-3.5-flash-lite...`);
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                throw err;
            }
        }

        if (!response || !response.text) {
            throw new Error("Empty response received from AI model");
        }

        const parsed = JSON.parse(response.text);

        return {
            term: term.trim(),
            summary: parsed.summary || `${term} is a biomarker evaluated in standard laboratory blood tests.`,
            functionInBody: parsed.functionInBody || "Plays an essential physiological role in metabolic balance.",
            highFactors: Array.isArray(parsed.highFactors) ? parsed.highFactors : ["Dehydration or concentrated blood sample", "Dietary variations"],
            lowFactors: Array.isArray(parsed.lowFactors) ? parsed.lowFactors : ["Nutritional deficiency", "Temporary physiological variation"],
            supportiveHabits: Array.isArray(parsed.supportiveHabits) ? parsed.supportiveHabits : ["Maintain balanced daily hydration", "Focus on nutrient-dense meals"],
            doctorQuestions: Array.isArray(parsed.doctorQuestions) ? parsed.doctorQuestions : ["How does this result relate to my overall health?", "Do I need a repeat test?"],
            sources: sources
        };

    } catch (error) {
        console.error("Biomarker Explainer Service Error:", error.message);
        return {
            term: term,
            summary: `${term} is a blood test measurement. It provides valuable insight into your physiological wellness and routine health balance.`,
            functionInBody: "Serves an important role in cellular or organ system function.",
            highFactors: ["Hydration levels and dietary factors", "Recent physical exertion or acute stress"],
            lowFactors: ["Nutritional factors and intake", "General biological variation"],
            supportiveHabits: ["Drink adequate water throughout the day", "Prioritize balanced meals, regular sleep, and light activity"],
            doctorQuestions: ["What range is optimal for my age and lifestyle?", "When would you recommend re-testing?"],
            sources: []
        };
    }
}

export default explainBiomarker;
