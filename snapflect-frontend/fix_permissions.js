const fs = require('fs');
const path = require('path');

const permMap = {
    'organization': 'Governance.Organizations.Manage',
    'business-unit': 'Governance.BusinessUnits.Manage',
    'department': 'Governance.Departments.Manage',
    'location': 'Governance.Locations.Manage',
    'user': 'Security.Users.Manage',
    'role': 'Security.Roles.Manage',
    'permission': 'Security.Permissions.Assign',
    'assessment': 'Assessment.Catalog.Manage',
    'category': 'Assessment.Metadata.Manage',
    'competency': 'Assessment.Competencies.Manage',
    'publication': 'Assessment.Publications.Manage',
    'question': 'Assessment.Questions.Create',
    'question-bank': 'Assessment.QuestionBanks.Manage',
    'question-tag': 'Assessment.Metadata.Manage',
    'type': 'Assessment.Metadata.Manage',
    'session': 'Delivery.Sessions.Terminate'
};

const actionMethods = [
    'openCreateForm(', 'openEditForm(', 'deleteOrg(', 'deleteBU(', 'deleteDept(', 'deleteLocation(',
    'deleteUser(', 'deleteRole(', 'deleteAssessment(', 'goToDesigner(', 'submitReview(', 'approveAssessment(',
    'openPublishWizard(', 'cloneAssessment(', 'rejectAssessment(', 'archiveAssessment(', 'deleteCategory(',
    'deleteCompetency(', 'deletePublication(', 'deleteQuestion(', 'deleteBank(', 'deleteTag(', 'deleteType(',
    'terminateSession(', 'pauseSession(', 'resumeSession(', 'openRoleModal(', 'revokeRole(', 'assignRole(',
    'deletePermission('
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix import path 
    if (content.includes("import { UserStore } from '../../../../shared/stores/user.store';")) {
        content = content.replace("import { UserStore } from '../../../../shared/stores/user.store';", "import { UserStore } from '../../../../../shared/stores/user.store';");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed import in ${filePath}`);
    }
}
        // Check if it calls an action method
        const hasAction = actionMethods.some(method => attrs.includes(`(click)="${method}`));
        if (!hasAction) return match;

        // Strip existing outer parens if we added them in previous runs

        // If it has *ngIf, append
        if (attrs.includes('*ngIf="')) {
            const ngIfRegex = /\*ngIf="([^"]+)"/;
            match = match.replace(ngIfRegex, (ngIfMatch, ngIfContent) => {
                // Remove existing permission check if we injected it wrongly before
                let cleanContent = ngIfContent;
                if (cleanContent.includes('&& userStore.hasAnyPermission')) {
                    cleanContent = cleanContent.split('&& userStore.hasAnyPermission')[0].trim();
                }
                // Strip existing outer parens if we added them
                if (cleanContent.startsWith('(') && cleanContent.endsWith(')')) {
                    cleanContent = cleanContent.substring(1, cleanContent.length - 1);
                }
                return `*ngIf="(${cleanContent}) && userStore.hasAnyPermission(['${perm}'])"`;
            });
            modified = true;
            return match;
        } else {
            // Add *ngIf
            modified = true;
            return `<button *ngIf="userStore.hasAnyPermission(['${perm}'])" ${attrs}>`;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath} with permission: ${perm}`);
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
