import path from 'path';
import retrieveContext from "../rag/retrieval.service.js";
import ai from "../../config/llm.js";
import ReportModel from "../../models/Report.model.js";
import { detectReportImbalances, buildGuidanceContext } from "../report/guidance.service.js";
import { Type } from "@google/genai";

async function getResponseForQuery(query, reportId, conversationHistory = []) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    try {
        if (!query || query.trim().length === 0) {
            throw new Error('Query is required.');
        }

        // 1. Fetch patient report if provided
        let patientReport = null;
        let reportDataText = "No patient report selected for this query.";
        let abnormalImbalances = [];

        if (reportId) {
            try {
                patientReport = await ReportModel.findById(reportId);
                if (patientReport) {
                    abnormalImbalances = detectReportImbalances(patientReport.biomarkers || []);
                    reportDataText = JSON.stringify({
                        patientDetails: patientReport.patientDetails,
                        biomarkers: patientReport.biomarkers
                    }, null, 2);
                }
            } catch (err) {
                console.warn("Could not load report by ID:", reportId);
            }
        }

        // 2. Retrieve RAG vector context for query
        let context = await retrieveContext(query, 4);

        // If query relates to abnormal biomarkers and context is sparse, search category knowledge
        if ((!context || context.length === 0) && abnormalImbalances.length > 0) {
            const firstCategory = abnormalImbalances[0].category;
            context = await retrieveContext(firstCategory, 3);
        }

        // 3. Format source citations
        const sources = (context || []).map(item => ({
            source: item.source,
            category: item.category || 'General Medical Reference',
            fileName: path.basename(item.source || 'Medical Guide'),
            snippet: (item.chunk || '').substring(0, 160) + '...'
        }));

        const contextText = (context && context.length > 0)
            ? context.map((item, index) => `SOURCE ${index + 1} [${path.basename(item.source || '')} - Category: ${item.category || 'General'}]:\n${item.chunk}`).join("\n\n")
            : "No specific medical reference documents matched this exact query.";

        // 4. Format recent dialogue history (last 6 turns)
        let historyText = "No previous messages in this conversation.";
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            const recent = conversationHistory.slice(-6);
            historyText = recent.map(m => `${m.sender === 'user' ? 'User' : 'BloodLens Assistant'}: ${m.text}`).join("\n");
        }

        // 5. Build guidance constraints
        const guidanceContext = buildGuidanceContext(abnormalImbalances);
        const guidanceText = guidanceContext 
            ? `DETECTED REPORT IMBALANCES:\n${guidanceContext.summary}\nALLOWED GUIDANCE TOPICS: ${guidanceContext.allowedDomains.join(', ')}\nSAFETY CONSTRAINTS: ${guidanceContext.safetyConstraints.join(' ')}`
            : "No abnormal report imbalances detected.";

        // 6. Build empathetic, structured prompt
        const prompt = `
You are BloodLens Assistant, a warm, supportive, and knowledgeable health guide.
Your purpose is to help users understand their laboratory test results and blood reports in clear, plain language.

VOICE & TONE:
- Empathetic, friendly, respectful, and reassuring.
- Speak like a caring health educator, NOT like an intimidating clinical paper or an alarmist.
- Communicate with clarity. Explain medical terms simply when they appear.

CONVERSATION CONTEXT (PREVIOUS MESSAGES):
${historyText}

PATIENT REPORT DATA (ACTIVE REPORT):
${reportDataText}

PROACTIVE GUIDANCE CONTEXT:
${guidanceText}

RETRIEVED MEDICAL KNOWLEDGE (RAG EVIDENCE):
${contextText}

CURRENT USER MESSAGE:
"${query}"

RESPONSE GUIDELINES & ADAPTIVE STRUCTURE:
1. ADAPT TO THE QUESTION TYPE:
   - IF THE USER ASKS ABOUT AN ABNORMAL TEST RESULT, CONCERN, OR "WHAT CAN I DO":
     Use clear, friendly markdown sections:
     * **What your report shows**: Plainly state the result vs the normal reference range.
     * **In simple terms**: Explain what this biomarker does in the body without confusing jargon.
     * **Everyday healthy habits**: Provide 2-3 non-prescriptive, practical lifestyle ideas (dietary choices, hydration, sleep, light exercise).
     * **When to speak with your doctor**: Explain supportive reasons to review this with their healthcare provider.
   - IF THE USER ASKS A GENERAL, CONCEPTUAL, OR CASUAL QUESTION (e.g. "What is hemoglobin?", "Hello", "Thanks"):
     Respond naturally, warmly, and concisely. DO NOT force the 4-section layout when a direct, friendly answer is better.
   - IF THE USER ASKS FOR A PRESCRIPTION, MEDICATION DOSAGE, OR DIAGNOSIS (e.g. "How much medicine should I take?"):
     Politely clarify that medications, dosages, and formal diagnoses must always be determined by a qualified doctor or pharmacist. Then provide safe, general educational information.

2. CRITICAL MEDICAL SAFETY RULES:
   - Do NOT make definitive diagnostic claims (e.g. never say "You have anemia" or "You are suffering from diabetes"). Instead say: "This value is lower than typical, which can sometimes be related to...".
   - Do NOT prescribe medication, drug dosages, or aggressive supplement regimens.
   - Do NOT invent reference ranges. Use the numbers provided in the report and trusted knowledge.
   - Ground medical explanations in the provided context.

3. FOLLOW-UP QUESTIONS:
   - Generate 2 to 3 natural, relevant follow-up questions the user might want to ask next based on this conversation.
`;

        console.log(`Generating chat response with model: ${modelName}...`);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        answer: {
                            type: Type.STRING,
                            description: "The empathetic, clear, markdown-formatted response."
                        },
                        guidance: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of general lifestyle pointers (nutrition, hydration, activity, sleep) if relevant; empty array if not applicable."
                        },
                        followUpQuestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "2-3 short, personalized follow-up questions for the user to explore next."
                        }
                    },
                    required: ["answer", "followUpQuestions"]
                }
            }
        });

        if (!response || !response.text) {
            throw new Error("Empty response received from Gemini");
        }

        let parsedOutput;
        try {
            parsedOutput = JSON.parse(response.text);
        } catch (parseErr) {
            console.warn("Could not parse JSON response from Gemini, wrapping text response");
            parsedOutput = {
                answer: response.text,
                guidance: [],
                followUpQuestions: [
                    "What does this result mean for my daily health?",
                    "What lifestyle habits support healthy levels?",
                    "Should I discuss this with my doctor?"
                ]
            };
        }

        // Validate and clean output structure
        const validatedAnswer = typeof parsedOutput.answer === 'string' && parsedOutput.answer.trim().length > 0
            ? parsedOutput.answer.trim()
            : "I've reviewed your report details. Please let me know if you'd like me to explain any specific biomarker or test result.";

        const validatedFollowUps = Array.isArray(parsedOutput.followUpQuestions) && parsedOutput.followUpQuestions.length > 0
            ? parsedOutput.followUpQuestions.slice(0, 3)
            : [
                "Which values in my report need attention?",
                "What everyday habits support my biomarkers?",
                "When should I repeat this blood test?"
            ];

        const validatedGuidance = Array.isArray(parsedOutput.guidance) ? parsedOutput.guidance : [];

        return {
            answer: validatedAnswer,
            guidance: validatedGuidance,
            followUpQuestions: validatedFollowUps,
            sources: sources
        };

    } catch (error) {
        console.error("Chat Service Error:", error.message);
        
        // Graceful fallback response without exposing technical errors
        return {
            answer: "I'm having a little trouble retrieving detailed information right now. Your report data is completely safe. Please feel free to ask your question again in a moment, or ask about a specific biomarker like Hemoglobin or Glucose.",
            guidance: [],
            followUpQuestions: [
                "What is considered a normal hemoglobin range?",
                "Which values should I pay attention to?",
                "How can I prepare questions for my doctor?"
            ],
            sources: []
        };
    }
}

export default getResponseForQuery;