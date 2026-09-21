const defaultReport = {
    "patientDetails": {
        "name": "Rahul Sharma",
        "age": "24 years",
        "gender": "Male",
        "reportDate": "12 September 2026"
    },
    "aiSummary": "Your blood report looks generally healthy. Most of the values are within the expected range. Your hemoglobin, blood sugar, and cholesterol levels look normal.\n\nYour vitamin D level is slightly lower than the usual range. This can sometimes happen when the body does not get enough vitamin D. Consider discussing this result with a healthcare professional.",
    "biomarkers": [
        {
            "name": "Hemoglobin",
            "value": 14.2,
            "unit": "g/dL",
            "range": {
                "min": "13.0",
                "max": "17.0",
            },
            "status": "Normal",
            "comparisonText": "Compared with reference range"
        },
        {
            "name": "Blood Glucose",
            "value": 92,
            "unit": "mg/dL",
            "range": {
                "min": "70",
                "max": "100",
            },
            "status": "Normal",
            "comparisonText": "Compared with reference range"
        },
        {
            "name": "Total Cholesterol",
            "value": 178,
            "unit": "mg/dL",
            "range": {
                "min": "0",
                "max": "200",
            },
            "status": "Normal",
            "comparisonText": "Compared with reference range"
        },
        {
            "name": "Vitamin D",
            "value": 21,
            "unit": "ng/mL",
            "range": {
                "min": "30",
                "max": "100",
            },
            "status": "Low",
            "comparisonText": "Compared with reference range"
        },
        {
            "name": "Vitamin B12",
            "value": 486,
            "unit": "pg/mL",
            "range": {
                "min": "200",
                "max": "900",
            },
            "status": "Normal",
            "comparisonText": "Compared with reference range"
        },
        {
            "name": "Creatinine",
            "value": 0.9,
            "unit": "mg/dL",
            "range": {
                "min": "0.7",
                "max": "1.3",
            },
            "status": "Normal",
            "comparisonText": "Compared with reference range"
        }
    ]
}

export default defaultReport;