const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/governance/pages/organization/list',
    'features/governance/pages/organization/create',
    'features/governance/pages/organization/edit',
    'features/governance/pages/organization/detail',
    'features/governance/pages/department/list',
    'features/governance/pages/department/create',
    'features/governance/pages/department/edit',
    'features/governance/pages/role/list',
    'features/governance/pages/role/create',
    'features/governance/pages/role/edit',
    'features/governance/pages/permission/list',
    'features/governance/pages/user/list',
    'features/governance/pages/user/create',
    'features/governance/pages/user/edit',
    'features/governance/pages/user/detail',
    'features/governance/components/organization-form',
    'features/governance/components/department-form',
    'features/governance/components/role-form',
    'features/governance/components/user-form',
    'features/governance/components/permission-grid',
    'features/governance/facades',
    'core/api',
    'shared/stores'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- STORES ---
writeTsFile('shared/stores/governance.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class GovernanceStore {\n" +
"  private readonly _departments = signal<any[]>([]);\n" +
"  private readonly _roles = signal<any[]>([]);\n" +
"  private readonly _permissions = signal<any[]>([]);\n" +
"  private readonly _users = signal<any[]>([]);\n" +
"  public readonly departments = this._departments.asReadonly();\n" +
"  public readonly roles = this._roles.asReadonly();\n" +
"  public readonly permissions = this._permissions.asReadonly();\n" +
"  public readonly users = this._users.asReadonly();\n" +
"  public setDepartments(data: any[]): void { this._departments.set(data); }\n" +
"  public setRoles(data: any[]): void { this._roles.set(data); }\n" +
"  public setPermissions(data: any[]): void { this._permissions.set(data); }\n" +
"  public setUsers(data: any[]): void { this._users.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/organization.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class OrganizationStore {\n" +
"  private readonly _organizations = signal<any[]>([]);\n" +
"  private readonly _currentOrg = signal<any | null>(null);\n" +
"  public readonly organizations = this._organizations.asReadonly();\n" +
"  public readonly currentOrg = this._currentOrg.asReadonly();\n" +
"  public setOrganizations(data: any[]): void { this._organizations.set(data); }\n" +
"  public setCurrentOrg(data: any): void { this._currentOrg.set(data); }\n" +
"}\n"
);

// --- API SERVICE ---
writeTsFile('core/api/governance-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class GovernanceApiService extends BaseApiService {\n" +
"  public getOrganizations(): Observable<any> { return this.http.get(this.baseUrl + '/organizations'); }\n" +
"  public getDepartments(): Observable<any> { return this.http.get(this.baseUrl + '/departments'); }\n" +
"  public getRoles(): Observable<any> { return this.http.get(this.baseUrl + '/roles'); }\n" +
"  public getPermissions(): Observable<any> { return this.http.get(this.baseUrl + '/permissions'); }\n" +
"  public getUsers(): Observable<any> { return this.http.get(this.baseUrl + '/users'); }\n" +
"}\n"
);

// --- FACADE ---
writeTsFile('features/governance/facades/governance.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { GovernanceApiService } from '../../../core/api/governance-api.service';\n" +
"import { GovernanceStore } from '../../../shared/stores/governance.store';\n" +
"import { OrganizationStore } from '../../../shared/stores/organization.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class GovernanceFacade {\n" +
"  private api = inject(GovernanceApiService);\n" +
"  private store = inject(GovernanceStore);\n" +
"  private orgStore = inject(OrganizationStore);\n" +
"  public loadOrganizations() { return this.api.getOrganizations().pipe(tap(res => this.orgStore.setOrganizations(res.data))); }\n" +
"  public loadDepartments() { return this.api.getDepartments().pipe(tap(res => this.store.setDepartments(res.data))); }\n" +
"  public loadRoles() { return this.api.getRoles().pipe(tap(res => this.store.setRoles(res.data))); }\n" +
"  public loadPermissions() { return this.api.getPermissions().pipe(tap(res => this.store.setPermissions(res.data))); }\n" +
"  public loadUsers() { return this.api.getUsers().pipe(tap(res => this.store.setUsers(res.data))); }\n" +
"}\n"
);

// --- COMPONENTS ---
const components = ['organization-form', 'department-form', 'role-form', 'user-form', 'permission-grid'];
components.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/governance/components/' + c + '/' + c + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + c + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- PAGES ---
const pages = [
    { entity: 'organization', actions: ['list', 'create', 'edit', 'detail'] },
    { entity: 'department', actions: ['list', 'create', 'edit'] },
    { entity: 'role', actions: ['list', 'create', 'edit'] },
    { entity: 'permission', actions: ['list'] },
    { entity: 'user', actions: ['list', 'create', 'edit', 'detail'] }
];

pages.forEach(p => {
    p.actions.forEach(a => {
        const componentName = p.entity + '-' + a + '-page';
        const className = p.entity.charAt(0).toUpperCase() + p.entity.slice(1) + a.charAt(0).toUpperCase() + a.slice(1) + 'PageComponent';
        writeTsFile('features/governance/pages/' + p.entity + '/' + a + '/' + componentName + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + componentName + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
        );
    });
});

// --- ROUTING ---
writeTsFile('features/governance/governance.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { OrganizationListPageComponent } from './pages/organization/list/organization-list-page.component';\n" +
"import { DepartmentListPageComponent } from './pages/department/list/department-list-page.component';\n" +
"import { RoleListPageComponent } from './pages/role/list/role-list-page.component';\n" +
"import { PermissionListPageComponent } from './pages/permission/list/permission-list-page.component';\n" +
"import { UserListPageComponent } from './pages/user/list/user-list-page.component';\n" +
"\n" +
"export const GOVERNANCE_ROUTES: Routes = [\n" +
"  { path: 'organizations', component: OrganizationListPageComponent },\n" +
"  { path: 'departments', component: DepartmentListPageComponent },\n" +
"  { path: 'roles', component: RoleListPageComponent },\n" +
"  { path: 'permissions', component: PermissionListPageComponent },\n" +
"  { path: 'users', component: UserListPageComponent },\n" +
"  { path: '', redirectTo: 'organizations', pathMatch: 'full' }\n" +
"];\n"
);

console.log('Sprint 05 Phase 4 Governance UI generated successfully.');
