const fs = require('fs');
const execSync = require('child_process').execSync;

function extractText(file) {
    try {
        const result = execSync(`tar -xf "${file}" word/document.xml -O`).toString();
        const text = result.replace(/<[^>]+>/g, ' ');
        console.log(`\n\n--- CONTENT OF ${file} ---\n`);
        console.log(text.substring(0, 10000)); // Print up to 10000 chars
    } catch(e) {
        console.error("Error reading " + file + ": " + e.message);
    }
}

extractText("Documents/Snapflect Assessment Portal - 062A SCORING SCHEMA Part 1 v1.0.docx");
extractText("Documents/Snapflect Assessment Portal - 062A SCORING SCHEMA Part 2 v1.0.docx");
