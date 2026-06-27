const fs = require('fs');
const execSync = require('child_process').execSync;

function extractText(file) {
    try {
        const result = execSync(`tar -xf "${file}" word/document.xml -O`).toString();
        const text = result.replace(/<[^>]+>/g, ' ');
        console.log(`\n\n--- CONTENT OF ${file} ---\n`);
        console.log(text.substring(0, 30000));
    } catch(e) {
        console.error("Error reading " + file + ": " + e.message);
    }
}

extractText("Documents/103_SPRINT_06_EXECUTION_PACKAGE_v1.0.docx");
extractText("Documents/104_ASSESSMENT_EXECUTION_ARCHITECTURE_v1.0.docx");
extractText("Documents/105_ASSESSMENT_EXECUTION_RULEBOOK_v1.0.docx");
extractText("Documents/106_ASSESSMENT_EXECUTION_OPENAPI_v1.0.docx");
extractText("Documents/107_SPRINT_06_IMPLEMENTATION_PLAN_v1.0.docx");
extractText("Documents/108_SPRINT_06_READINESS_REVIEW.docx");
