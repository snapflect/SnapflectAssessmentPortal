const fs = require('fs');

function addRole(file, target, newRole) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(target) && !content.includes(target.replace(']', `, '${newRole}']`))) {
        content = content.replace(target, target.replace(']', `, '${newRole}']`));
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
}

const appRoutes = 'src/app/app.routes.ts';
addRole(appRoutes, "data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER'] }", 'READ_ONLY');
addRole(appRoutes, "data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'PROCTOR', 'SUPPORT', 'CANDIDATE', 'ASSESSMENT_MANAGER'] }", 'READ_ONLY');
addRole(appRoutes, "data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER'] }", 'READ_ONLY');

const resultsRoutes = 'src/app/features/results/results.routes.ts';
addRole(resultsRoutes, "data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER'] }", 'READ_ONLY');
