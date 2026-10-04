import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    patientDetails: {
        name: {
            type: String,
            default: "—"
        },
        age: {
            type: String,
            default: "—"
        },
        gender: {
            type: String,
            default: "—"
        },
        reportDate: {
            type: String,
            default: "—"
        }
    },
    aiSummary: {
        type: String,
        required: true
    },
    isDraft: {
        type: Boolean,
        default: false
    },
    biomarkers: [{
        name: {
            type: String,
            required: true
        },
        normalizedKey: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            default: "Other"
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        unit: {
            type: String,
            default: ""
        },
        range: {
            min: {
                type: mongoose.Schema.Types.Mixed,
                default: "-"
            },
            max: {
                type: mongoose.Schema.Types.Mixed,
                default: "-"
            },
            rawText: {
                type: String,
                default: ""
            }
        },
        status: {
            type: String,
            enum: ["Normal", "High", "Low"],
            default: "Normal"
        },
        confidence: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "high"
        },
        uncertainFlag: {
            type: Boolean,
            default: false
        },
        uncertaintyReason: {
            type: String,
            default: ""
        },
        comparisonText: {
            type: String,
            default: "Compared with reference range"
        }
    }]
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);