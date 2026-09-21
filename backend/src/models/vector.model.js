import mongoose from "mongoose";

const vectorSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true, 
    },
    category: {
        type: String, 
        required: true
    },
    chunk: {
        type: String, 
        required: true,
    },
    embedding: {
        type: [Number],
        required: true
    }
}, {timestamps: true});

export default mongoose.model('KnowledgeVector', vectorSchema);