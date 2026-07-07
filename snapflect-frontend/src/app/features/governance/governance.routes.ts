import { Routes } from '@angular/router';
// Billing component removed

export const GOVERNANCE_ROUTES: Routes = [
  // Organizations
  { path: 'organizations', loadComponent: () => import('./pages/organization/list/organization-list-page.component').then(m => m.OrganizationListPageComponent) },
  { path: 'organizations/create', loadComponent: () => import('./pages/organization/create/organization-create-page.component').then(m => m.OrganizationCreatePageComponent) },
  { path: 'organizations/:uuid', loadComponent: () => import('./pages/organization/detail/organization-detail-page.component').then(m => m.OrganizationDetailPageComponent) },
  { path: 'organizations/:uuid/edit', loadComponent: () => import('./pages/organization/edit/organization-edit-page.component').then(m => m.OrganizationEditPageComponent) },

  // Departments
  { path: 'departments', loadComponent: () => import('./pages/department/list/department-list-page.component').then(m => m.DepartmentListPageComponent) },
  { path: 'departments/create', loadComponent: () => import('./pages/department/create/department-create-page.component').then(m => m.DepartmentCreatePageComponent) },
  { path: 'departments/:uuid', loadComponent: () => import('./pages/department/detail/department-detail-page.component').then(m => m.DepartmentDetailPageComponent) },
  { path: 'departments/:uuid/edit', loadComponent: () => import('./pages/department/edit/department-edit-page.component').then(m => m.DepartmentEditPageComponent) },

  // Locations
  { path: 'locations', loadComponent: () => import('./pages/location/list/location-list-page.component').then(m => m.LocationListPageComponent) },
  { path: 'locations/create', loadComponent: () => import('./pages/location/create/location-create-page.component').then(m => m.LocationCreatePageComponent) },
  { path: 'locations/:uuid', loadComponent: () => import('./pages/location/detail/location-detail-page.component').then(m => m.LocationDetailPageComponent) },
  { path: 'locations/:uuid/edit', loadComponent: () => import('./pages/location/edit/location-edit-page.component').then(m => m.LocationEditPageComponent) },

  // Business Units
  { path: 'business-units', loadComponent: () => import('./pages/business-unit/list/business-unit-list-page.component').then(m => m.BusinessUnitListPageComponent) },
  { path: 'business-units/create', loadComponent: () => import('./pages/business-unit/create/business-unit-create-page.component').then(m => m.BusinessUnitCreatePageComponent) },
  { path: 'business-units/:uuid', loadComponent: () => import('./pages/business-unit/detail/business-unit-detail-page.component').then(m => m.BusinessUnitDetailPageComponent) },
  { path: 'business-units/:uuid/edit', loadComponent: () => import('./pages/business-unit/edit/business-unit-edit-page.component').then(m => m.BusinessUnitEditPageComponent) },

  // Roles
  { path: 'roles', loadComponent: () => import('./pages/role/list/role-list-page.component').then(m => m.RoleListPageComponent) },
  { path: 'roles/create', loadComponent: () => import('./pages/role/create/role-create-page.component').then(m => m.RoleCreatePageComponent) },
  { path: 'roles/:uuid', loadComponent: () => import('./pages/role/detail/role-detail-page.component').then(m => m.RoleDetailPageComponent) },
  { path: 'roles/:uuid/edit', loadComponent: () => import('./pages/role/edit/role-edit-page.component').then(m => m.RoleEditPageComponent) },

  // Permissions
  { path: 'permissions', loadComponent: () => import('./pages/permission/list/permission-list-page.component').then(m => m.PermissionListPageComponent) },

  // Users
  { path: 'user-lookup', loadComponent: () => import('./pages/user-lookup/user-lookup-page.component').then(m => m.UserLookupPageComponent) },
  { path: 'users', loadComponent: () => import('./pages/user/list/user-list-page.component').then(m => m.UserListPageComponent) },
  { path: 'users/create', loadComponent: () => import('./pages/user/create/user-create-page.component').then(m => m.UserCreatePageComponent) },
  { path: 'users/:uuid', loadComponent: () => import('./pages/user/detail/user-detail-page.component').then(m => m.UserDetailPageComponent) },
  { path: 'users/:uuid/edit', loadComponent: () => import('./pages/user/edit/user-edit-page.component').then(m => m.UserEditPageComponent) },

  // Billing
  { path: 'billing', loadComponent: () => import('./pages/billing/billing-page.component').then(m => m.BillingPageComponent) },

  // Fallback
  { path: '', redirectTo: 'organizations', pathMatch: 'full' }
];