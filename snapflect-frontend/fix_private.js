const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix private userStore -> public userStore
    if (content.includes("private userStore = inject(UserStore);") || content.includes("private userStore: UserStore = inject(UserStore);")) {
        content = content.replace(/private userStore/g, "public userStore");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Made userStore public in ${filePath}`);
    } else if (content.includes("private userStore")) {
        content = content.replace(/private userStore/g, "public userStore");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Made userStore public in ${filePath}`);
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
