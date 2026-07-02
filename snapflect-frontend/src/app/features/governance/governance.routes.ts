import { Routes } from '@angular/router';
import { OrganizationListPageComponent } from './pages/organization/list/organization-list-page.component';
import { DepartmentListPageComponent } from './pages/department/list/department-list-page.component';
import { LocationListPageComponent } from './pages/location/list/location-list-page.component';
import { BusinessUnitListPageComponent } from './pages/business-unit/list/business-unit-list-page.component';
import { RoleListPageComponent } from './pages/role/list/role-list-page.component';
import { PermissionListPageComponent } from './pages/permission/list/permission-list-page.component';
import { UserListPageComponent } from './pages/user/list/user-list-page.component';
import { BillingPageComponent } from './pages/billing/billing-page.component';

export const GOVERNANCE_ROUTES: Routes = [
  { path: 'organizations', component: OrganizationListPageComponent },
  { path: 'departments', component: DepartmentListPageComponent },
  { path: 'locations', component: LocationListPageComponent },
  { path: 'business-units', component: BusinessUnitListPageComponent },
  { path: 'roles', component: RoleListPageComponent },
  { path: 'permissions', component: PermissionListPageComponent },
  { path: 'users', component: UserListPageComponent },
  { path: 'billing', component: BillingPageComponent },
  { path: '', redirectTo: 'organizations', pathMatch: 'full' }
];