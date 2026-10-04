import retrieveContext from "../rag/retrieval.service.js";
import ai from "../../config/llm.js";
import { Type } from "@google/genai";
import { compareReports } from "./comparison.service.js";

export async function generateComparisonInsights(reportIds) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    try {
        // 1. Run comparison calculations
        const compData = await compareReports(reportIds);

        // 2. Identify significant shifts for RAG querying
        const significantShifts = compData.biomarkerComparisons.filter(b => 
            b.statusShift !== "Unchanged" || 
            (b.deltaPercentage !== null && Math.abs(b.deltaPercentage) >= 10)
        );

        const categoriesToQuery = [...new Set(significantShifts.map(s => s.category))];
        let ragContextText = "";

        if (categoriesToQuery.length > 0) {
            const contextResults = await Promise.all(
                categoriesToQuery.slice(0, 3).map(cat => retrieveContext(cat, 2))
            );
            const flatContexts = contextResults.flat();
            ragContextText = flatContexts.map((c, i) => `EVIDENCE ${i + 1}: ${c.chunk}`).join("\n\n");
        }

        // 3. Format compact delta text for Gemini
        const dates = compData.reportHeaders.map(h => h.reportDate).join(" vs ");
        const shiftsSummary = compData.biomarkerComparisons
            .map(b => {
                const val1 = b.first ? `${b.first.value} ${b.first.unit} (${b.first.status})` : 'Not Measured';
                const val2 = b.latest ? `${b.latest.value} ${b.latest.unit} (${b.latest.status})` : 'Not Measured';
                const delta = b.deltaPercentage !== null ? `Δ ${b.deltaPercentage > 0 ? '+' : ''}${b.deltaPercentage}%` : 'N/A';
                return `- ${b.displayName} (${b.category}): ${val1} -> ${val2} [${delta}]`;
            })
            .join("\n");

        const prompt = `
You are BloodLens Health Guide, an empathetic, non-diagnostic medical educator.
You are comparing longitudinal blood report results between two dates (${dates}).

OBSERVED BIOMARKER CHANGES:
${shiftsSummary}

GROUNDING MEDICAL LITERATURE:
${ragContextText || "Standard clinical laboratory reference guides."}

INSTRUCTIONS:
Synthesize an educational breakdown of how the recorded values have changed across time:
1. narrative: A compassionate, clear 3-4 sentence overview of the patient's biomarker trajectory. Highlight values that remained stable or improved, and gently describe values that shifted outside standard brackets.
2. keyProgressions: 2-3 bullet items noting positive or stabilized metrics.
3. areasToObserve: 2-3 bullet items noting metrics that increased or decreased significantly.
4. everydayFactors: 3-4 evidence-based everyday factors that may naturally influence these specific biomarkers (e.g. hydration levels before the blood draw, dietary patterns, sleep quality, recent exercise, fasting duration). Do NOT state these as causes of disease.
5. doctorDiscussionQuestions: 3-5 personalized, empowering questions the user could bring to their healthcare professional during their next visit.

SAFETY RULES:
- Strictly prohibited: Diagnosing diseases or claiming the patient has an illness.
- Strictly prohibited: Prescribing medications or recommending supplement dosages.
- Always frame lifestyle pointers as general wellness awareness to discuss with a licensed physician.
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
                                narrative: { type: Type.STRING },
                                keyProgressions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                areasToObserve: { type: Type.ARRAY, items: { type: Type.STRING } },
                                everydayFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                                doctorDiscussionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["narrative", "keyProgressions", "areasToObserve", "everydayFactors", "doctorDiscussionQuestions"]
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
            comparisonData: compData,
            insights: {
                narrative: parsed.narrative,
                keyProgressions: parsed.keyProgressions || [],
                areasToObserve: parsed.areasToObserve || [],
                everydayFactors: parsed.everydayFactors || [],
                doctorDiscussionQuestions: parsed.doctorDiscussionQuestions || [],
                disclaimer: "These comparative insights and discussion suggestions are strictly educational. They do not constitute a medical diagnosis or treatment plan. Always consult with a qualified physician."
            }
        };

    } catch (error) {
        console.error("Comparison Insights Error:", error.message);
        const compData = await compareReports(reportIds);
        return {
            comparisonData: compData,
            insights: {
                narrative: "Comparing your reports shows how your biomarkers have tracked over time. Review individual metrics in the chart and table below to observe shifts relative to standard clinical brackets.",
                keyProgressions: ["Several biomarkers remain well-aligned with standard reference ranges."],
                areasToObserve: ["Observe values exhibiting upward or downward movement between test dates."],
                everydayFactors: [
                    "Hydration status before blood draws can influence concentration metrics.",
                    "Fasting versus non-fasting conditions impact metabolic markers.",
                    "Recent sleep patterns and acute physical activity can temporarily shift metabolic indicators."
                ],
                doctorDiscussionQuestions: [
                    "How do these longitudinal changes relate to my overall health goals?",
                    "Are any shifted biomarkers clinically significant for my age?",
                    "When do you recommend our next routine blood test follow-up?"
                ],
                disclaimer: "These comparative insights are for general educational awareness only. Always discuss test changes with your physician."
            }
        };
    }
}
