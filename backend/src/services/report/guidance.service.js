/**
 * Lean Hybrid Health Guidance Service
 * 
 * Responsibilities:
 * 1. Deterministically detects abnormal (High / Low) biomarkers from report data.
 * 2. Maps abnormalities to relevant knowledge base categories.
 * 3. Defines strict allowed guidance boundaries (nutrition, hydration, sleep, activity).
 * 4. Enforces safety exclusions (no medication, no dosages, no diagnoses).
 */

const CATEGORY_MAPPINGS = {
    // CBC / Blood count
    hemoglobin: 'cbc',
    rbc: 'cbc',
    'red blood cells': 'cbc',
    wbc: 'cbc',
    'white blood cells': 'cbc',
    platelets: 'cbc',
    hematocrit: 'cbc',

    // Blood Sugar / Diabetes
    glucose: 'diabetes',
    'blood glucose': 'diabetes',
    'fasting glucose': 'diabetes',
    'post prandial glucose': 'diabetes',
    hba1c: 'diabetes',

    // Lipid Profile
    cholesterol: 'lipids',
    'total cholesterol': 'lipids',
    triglycerides: 'lipids',
    'triglyceride': 'lipids',
    hdl: 'lipids',
    ldl: 'lipids',
    vldl: 'lipids',

    // Vitamins & Minerals
    'vitamin d': 'vitamins',
    'vitamin d3': 'vitamins',
    'vitamin b12': 'vitamins',
    'b12': 'vitamins',
    folate: 'vitamins',
    'folic acid': 'vitamins',

    // Kidney Function
    creatinine: 'kidney',
    urea: 'kidney',
    bun: 'kidney',
    'blood urea nitrogen': 'kidney',
    egfr: 'kidney',

    // Liver Function
    alt: 'liver',
    sgpt: 'liver',
    ast: 'liver',
    sgot: 'liver',
    bilirubin: 'liver',
    alp: 'liver',

    // Thyroid Profile
    tsh: 'thyroids',
    t3: 'thyroids',
    t4: 'thyroids'
};

const ALLOWED_GUIDANCE_DOMAINS = [
    'general_nutrition_and_dietary_habits',
    'daily_hydration',
    'moderate_physical_activity',
    'sleep_hygiene_and_rest',
    'everyday_wellness_routines'
];

const STRICT_SAFETY_CONSTRAINTS = [
    'STRICTLY_PROHIBITED: Prescribing medications, pharmaceutical drugs, or brand names.',
    'STRICTLY_PROHIBITED: Specifying drug or supplement dosages (e.g. mg, IU, tablets).',
    'STRICTLY_PROHIBITED: Stating definitive diagnoses or claiming the patient has a specific disease.',
    'MANDATORY: Explicitly state that lifestyle suggestions are general educational ideas to discuss with a healthcare professional.'
];

/**
 * Detects abnormal biomarkers from the report and maps their categories
 */
export function detectReportImbalances(biomarkers = []) {
    if (!Array.isArray(biomarkers)) return [];

    const abnormal = [];

    for (const marker of biomarkers) {
        const status = (marker.status || '').toLowerCase();
        if (status === 'high' || status === 'low') {
            const nameLower = (marker.name || '').toLowerCase().trim();
            let matchedCategory = 'general';

            for (const [key, cat] of Object.entries(CATEGORY_MAPPINGS)) {
                if (nameLower.includes(key)) {
                    matchedCategory = cat;
                    break;
                }
            }

            abnormal.push({
                name: marker.name,
                value: marker.value,
                unit: marker.unit || '',
                range: marker.range || {},
                status: marker.status, // "High" or "Low"
                category: matchedCategory
            });
        }
    }

    return abnormal;
}

/**
 * Builds the guidance prompt specification for Gemini
 */
export function buildGuidanceContext(abnormalMarkers = []) {
    if (abnormalMarkers.length === 0) {
        return null;
    }

    const markerSummaries = abnormalMarkers.map(m => 
        `- ${m.name}: ${m.value} ${m.unit} (Status: ${m.status}, Reference Range: ${m.range?.rawText || `${m.range?.min || ''} - ${m.range?.max || ''}`}) [Category: ${m.category}]`
    ).join('\n');

    return {
        hasImbalances: true,
        summary: markerSummaries,
        allowedDomains: ALLOWED_GUIDANCE_DOMAINS,
        safetyConstraints: STRICT_SAFETY_CONSTRAINTS
    };
}
