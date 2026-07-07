const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix import path 
    if (content.includes("import { UserStore } from '../../../../shared/stores/user.store';")) {
        content = content.replace("import { UserStore } from '../../../../shared/stores/user.store';", "import { UserStore } from '../../../../../shared/stores/user.store';");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed import in ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('list-page.component.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src', 'app', 'features'));
