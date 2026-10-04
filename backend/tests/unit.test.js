import { describe, it, expect } from '@jest/globals';
import chunkText from '../src/services/rag/chunk.service.js';
import { detectReportImbalances, buildGuidanceContext } from '../src/services/report/guidance.service.js';
import { getNormalizedBiomarkerKey, inferCategory } from '../src/services/report/analyzeReport.service.js';

describe('Unit Tests: Processing & Normalization', () => {
    describe('Biomarker Key Normalization', () => {
        it('should correctly normalize synonyms and abbreviations', () => {
            expect(getNormalizedBiomarkerKey('Hemoglobin (Hb)')).toBe('hemoglobin');
            expect(getNormalizedBiomarkerKey('Hb')).toBe('hemoglobin');
            expect(getNormalizedBiomarkerKey('Fasting Blood Sugar')).toBe('glucose_fasting');
            expect(getNormalizedBiomarkerKey('Total Cholesterol')).toBe('cholesterol_total');
            expect(getNormalizedBiomarkerKey('SGPT (ALT)')).toBe('alt_sgpt');
            expect(getNormalizedBiomarkerKey('Vitamin D3 25-OH')).toBe('vitamin_d');
        });
    });

    describe('Clinical Category Inference', () => {
        it('should correctly infer categories for various biomarkers', () => {
            expect(inferCategory('Hemoglobin')).toBe('CBC');
            expect(inferCategory('Platelet Count')).toBe('CBC');
            expect(inferCategory('Total Cholesterol')).toBe('Lipids');
            expect(inferCategory('Triglycerides')).toBe('Lipids');
            expect(inferCategory('Fasting Blood Glucose')).toBe('Metabolic');
            expect(inferCategory('HbA1c')).toBe('Metabolic');
            expect(inferCategory('Serum Creatinine')).toBe('Kidney');
            expect(inferCategory('Blood Urea Nitrogen')).toBe('Kidney');
            expect(inferCategory('SGOT / AST')).toBe('Liver');
            expect(inferCategory('Bilirubin Total')).toBe('Liver');
            expect(inferCategory('TSH (Ultrasensitive)')).toBe('Thyroid');
            expect(inferCategory('Vitamin B12')).toBe('Vitamins');
        });
    });

    describe('Imbalance Detection & Proactive Guidance', () => {
        it('should detect abnormal values and build medical safety context', () => {
            const mockBiomarkers = [
                { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', status: 'Low' },
                { name: 'Glucose', value: 135, unit: 'mg/dL', status: 'High' },
                { name: 'Creatinine', value: 0.9, unit: 'mg/dL', status: 'Normal' }
            ];

            const imbalances = detectReportImbalances(mockBiomarkers);
            expect(imbalances.length).toBe(2);
            expect(imbalances.some(i => i.name === 'Hemoglobin')).toBe(true);
            expect(imbalances.some(i => i.name === 'Glucose')).toBe(true);

            const guidance = buildGuidanceContext(imbalances);
            expect(guidance.hasImbalances).toBe(true);
            expect(guidance.safetyConstraints.length).toBeGreaterThan(0);
        });
    });

    describe('RAG Chunking Engine', () => {
        it('should chunk text with defined overlap', () => {
            const text = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
            const chunks = chunkText(text, 100, 20);
            expect(chunks.length).toBeGreaterThan(1);
        });
    });
});
