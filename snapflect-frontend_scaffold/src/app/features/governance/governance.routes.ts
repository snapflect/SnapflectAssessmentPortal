import { Routes } from '@angular/router';
import { OrganizationListPageComponent } from './pages/organization/list/organization-list-page.component';
import { DepartmentListPageComponent } from './pages/department/list/department-list-page.component';
import { RoleListPageComponent } from './pages/role/list/role-list-page.component';
import { PermissionListPageComponent } from './pages/permission/list/permission-list-page.component';
import { UserListPageComponent } from './pages/user/list/user-list-page.component';

export const GOVERNANCE_ROUTES: Routes = [
  { path: 'organizations', component: OrganizationListPageComponent },
  { path: 'departments', component: DepartmentListPageComponent },
  { path: 'roles', component: RoleListPageComponent },
  { path: 'permissions', component: PermissionListPageComponent },
  { path: 'users', component: UserListPageComponent },
  { path: '', redirectTo: 'organizations', pathMatch: 'full' }
];