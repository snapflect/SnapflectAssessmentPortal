const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const unzip = promisify(zlib.unzip);

async function extractTextFromDocx(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err);
            
            let offset = 0;
            
            while (offset < data.length - 30) {
                const signature = data.readUInt32LE(offset);
                if (signature !== 0x04034b50) {
                    offset++; 
                    continue;
                }
                
                const compressedSize = data.readUInt32LE(offset + 18);
                const uncompressedSize = data.readUInt32LE(offset + 22);
                const fileNameLength = data.readUInt16LE(offset + 26);
                const extraFieldLength = data.readUInt16LE(offset + 28);
                
                const fileName = data.toString('utf8', offset + 30, offset + 30 + fileNameLength);
                
                const dataOffset = offset + 30 + fileNameLength + extraFieldLength;
                
                if (fileName === 'word/document.xml') {
                    const compressedData = data.slice(dataOffset, dataOffset + compressedSize);
                    
                    zlib.inflateRaw(compressedData, (err, buffer) => {
                        if (err) return reject(err);
                        let xml = buffer.toString('utf8');
                        let text = '';
                        const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
                        let match;
                        while ((match = regex.exec(xml)) !== null) {
                            text += match[1] + ' ';
                        }
                        resolve(text);
                    });
                    return;
                }
                offset = dataOffset + compressedSize;
            }
            reject(new Error("word/document.xml not found"));
        });
    });
}

async function main() {
    const dir = 'D:\\Mubarak\\SnapFlectMobileWebApp\\Snapflect Assessment Portal\\Documents';
    const files = [
        'Snapflect Assessment Portal - 042 SPRINT 03 EXECUTION PACKAGE v1.0.docx',
        'Snapflect Assessment Portal - 043 ASSESSMENT DELIVERY ARCHITECTURE v1.0.docx',
        'Snapflect Assessment Portal - 044 ATTEMPT AND SESSION SCHEMA_v1.0.docx',
        'Snapflect Assessment Portal - 044 ATTEMPT AND SESSION SCHEMA Part 1 v1.0.docx',
        'Snapflect Assessment Portal - 044 ATTEMPT AND SESSION SCHEMA Part 2 v1.0.docx',
        'Snapflect Assessment Portal - 046 SPRINT 03 IMPLEMENTATION PLAN v1.0.docx'
    ];

    let combinedText = '';
    for (const file of files) {
        try {
            console.log('Reading ' + file);
            const text = await extractTextFromDocx(path.join(dir, file));
            combinedText += '=== ' + file + ' ===\\n' + text + '\\n\\n';
        } catch (e) {
            console.error('Failed to read ' + file + ': ' + e.message);
        }
    }
    
    fs.writeFileSync('D:\\Mubarak\\SnapFlectMobileWebApp\\Snapflect Assessment Portal\\sprint3_docs.txt', combinedText);
    console.log('Extraction complete.');
}

main();
