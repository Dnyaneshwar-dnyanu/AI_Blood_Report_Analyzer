import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    sources: [{
        source: String,
        category: String,
        fileName: String,
        snippet: String
    }],
    guidance: [{
        type: String
    }],
    followUpQuestions: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    title: {
        type: String,
        default: 'Blood Report Chat'
    },
    messages: [messageSchema]
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
