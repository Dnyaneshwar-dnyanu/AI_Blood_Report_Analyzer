import getResponseForQueryService from "../services/llmService/chat.service.js";
import Conversation from "../models/Conversation.model.js";

export async function getResponseForQuery(req, res) {
    try {
        const { query, reportId, conversationId } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a question to ask." });
        }

        // 1. Fetch conversation history if available to support multi-turn context
        let conversation = null;
        let previousMessages = [];

        if (reportId || conversationId) {
            try {
                if (conversationId) {
                    conversation = await Conversation.findById(conversationId);
                } else if (reportId) {
                    conversation = await Conversation.findOne({ reportId }).sort({ updatedAt: -1 });
                }

                if (conversation && Array.isArray(conversation.messages)) {
                    previousMessages = conversation.messages.map(m => ({
                        sender: m.sender,
                        text: m.text
                    }));
                }
            } catch (err) {
                console.warn("Could not retrieve conversation history context:", err.message);
            }
        }

        // 2. Call chat service with query, reportId, and conversation history
        const result = await getResponseForQueryService(query.trim(), reportId, previousMessages);

        // 3. Persist conversation turn
        if (reportId) {
            try {
                if (!conversation) {
                    conversation = new Conversation({
                        userId: req.user ? req.user._id : null,
                        reportId: reportId,
                        title: query.substring(0, 35) + (query.length > 35 ? "..." : ""),
                        messages: []
                    });
                }

                conversation.messages.push({
                    sender: 'user',
                    text: query.trim(),
                    createdAt: new Date()
                });

                conversation.messages.push({
                    sender: 'assistant',
                    text: result.answer,
                    sources: result.sources || [],
                    guidance: result.guidance || [],
                    followUpQuestions: result.followUpQuestions || [],
                    createdAt: new Date()
                });

                await conversation.save();
            } catch (convErr) {
                console.warn("Could not persist conversation history:", convErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                answer: result.answer,
                guidance: result.guidance || [],
                followUpQuestions: result.followUpQuestions || [],
                sources: result.sources || [],
                conversationId: conversation ? conversation._id : null
            }
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "I'm having trouble responding right now. Please try asking again in a moment." 
        });
    }
}

export async function getChatHistory(req, res) {
    try {
        const { reportId } = req.params;
        if (!reportId) {
            return res.status(400).json({ success: false, message: "Report ID is required" });
        }

        const conversation = await Conversation.findOne({ reportId }).sort({ updatedAt: -1 });
        if (!conversation) {
            return res.status(200).json({ success: true, data: [] });
        }

        return res.status(200).json({
            success: true,
            data: conversation.messages,
            conversationId: conversation._id
        });
    } catch (error) {
        console.error("Get Chat History Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Unable to retrieve chat history at this time." 
        });
    }
}