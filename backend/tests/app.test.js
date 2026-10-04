import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';
import chunkText from '../src/services/rag/chunk.service.js';
import { detectReportImbalances, buildGuidanceContext } from '../src/services/report/guidance.service.js';

jest.setTimeout(90000);

describe('Blood Report Analyzer API & System Tests', () => {
    
    // 1. Chunking Unit Test
    describe('RAG Text Chunking', () => {
        it('should chunk text with overlap without mutating chunkSize', () => {
            const text = Array.from({ length: 1000 }, (_, i) => `word${i}`).join(' ');
            const chunks = chunkText(text, 500, 50);
            
            expect(chunks.length).toBeGreaterThan(1);
            expect(chunks[0].split(' ').length).toBe(500);
            // Verify step size (500 - 50 = 450 words)
            expect(chunks[1].split(' ').length).toBe(500);
            expect(chunks[0].split(' ').slice(450).join(' ')).toBe(chunks[1].split(' ').slice(0, 50).join(' '));
        });
    });

    // 2. Health Endpoint
    describe('GET /api/health', () => {
        it('should return 200 OK and active status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // 3. User Auth Endpoints
    describe('Authentication API', () => {
        const testUser = {
            name: 'Test Runner',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        };

        it('should register a new user and return JWT token', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });

        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });
    });

    // 4. Report Upload Validation Test
    describe('File Upload Security', () => {
        it('should reject file upload without file', async () => {
            const res = await request(app).post('/api/report/upload');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // 5. Lean Health Guidance Hybrid Engine
    describe('Guidance Service', () => {
        it('should detect abnormal biomarkers and map to proper categories', () => {
            const mockBiomarkers = [
                { name: 'Hemoglobin', value: 10.5, unit: 'g/dL', status: 'Low' },
                { name: 'Total Cholesterol', value: 240, unit: 'mg/dL', status: 'High' },
                { name: 'Platelets', value: 250000, unit: '/mcL', status: 'Normal' }
            ];

            const detected = detectReportImbalances(mockBiomarkers);
            expect(detected.length).toBe(2);
            expect(detected[0].name).toBe('Hemoglobin');
            expect(detected[0].category).toBe('cbc');
            expect(detected[1].name).toBe('Total Cholesterol');
            expect(detected[1].category).toBe('lipids');

            const context = buildGuidanceContext(detected);
            expect(context.hasImbalances).toBe(true);
            expect(context.allowedDomains).toContain('general_nutrition_and_dietary_habits');
            expect(context.safetyConstraints.some(c => c.includes('STRICTLY_PROHIBITED: Prescribing medications'))).toBe(true);
        });
    });

    // 6. Chat Query API & Structured Output
    describe('POST /api/chat/query', () => {
        it('should return error when query is empty', async () => {
            const res = await request(app)
                .post('/api/chat/query')
                .send({ query: '' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should process medical question and return structured answer, followUpQuestions, and sources', async () => {
            const res = await request(app)
                .post('/api/chat/query')
                .send({ query: 'What is a normal hemoglobin count for adults?' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.answer).toBeDefined();
            expect(Array.isArray(res.body.data.followUpQuestions)).toBe(true);
            expect(Array.isArray(res.body.data.sources)).toBe(true);
            expect(Array.isArray(res.body.data.guidance)).toBe(true);
        }, 90000);
    });

    // 8. Biomarker Normalization & Category Mapping
    describe('Biomarker Normalization & Categorization', () => {
        it('should correctly normalize biomarker keys and map clinical categories', async () => {
            const { getNormalizedBiomarkerKey, inferCategory } = await import('../src/services/report/analyzeReport.service.js');
            expect(getNormalizedBiomarkerKey('Hemoglobin (Hb)')).toBe('hemoglobin');
            expect(getNormalizedBiomarkerKey('Fasting Blood Glucose')).toBe('glucose_fasting');
            expect(getNormalizedBiomarkerKey('Total Cholesterol')).toBe('cholesterol_total');

            expect(inferCategory('Hemoglobin')).toBe('CBC');
            expect(inferCategory('Total Cholesterol')).toBe('Lipids');
            expect(inferCategory('Fasting Blood Sugar')).toBe('Metabolic');
            expect(inferCategory('Creatinine')).toBe('Kidney');
            expect(inferCategory('ALT / SGPT')).toBe('Liver');
            expect(inferCategory('TSH')).toBe('Thyroid');
            expect(inferCategory('Vitamin D3')).toBe('Vitamins');
        });
    });

    // 9. Batch Reports Retrieval
    describe('POST /api/report/batch', () => {
        it('should return error if ids array is missing or empty', async () => {
            const res = await request(app).post('/api/report/batch').send({ ids: [] });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // 10. Compare Reports Validation
    describe('POST /api/report/compare', () => {
        it('should return error if fewer than 2 reports provided', async () => {
            const res = await request(app).post('/api/report/compare').send({ reportIds: ['507f1f77bcf86cd799439011'] });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});

