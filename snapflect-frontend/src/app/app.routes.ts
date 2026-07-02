import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },

  // Governance: Org, Users, Roles, Departments, Locations, BUs
  {
    path: 'governance',
    loadChildren: () => import('./features/governance/governance.routes').then(m => m.GOVERNANCE_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'SUPPORT', 'READ_ONLY', 'BILLING_ADMIN'] }
  },

  // Authoring Studio: Questions, Banks, Assessments, Blueprints, Publications
  {
    path: 'authoring',
    loadChildren: () => import('./features/assessment/assessment.routes').then(m => m.ASSESSMENT_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER'] }
  },

  // Delivery: Candidate Dashboard, Sessions/Proctoring, Attempt runner
  {
    path: 'delivery',
    loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'PROCTOR', 'SUPPORT', 'CANDIDATE'] }
  },

  // Results & Analytics: Dashboard, Manual Scoring
  {
    path: 'results',
    loadChildren: () => import('./features/results/results.routes').then(m => m.RESULTS_ROUTES),
    canActivate: [roleGuard]
  },

  // Scoring alias → results/manual for reviewers
  {
    path: 'scoring',
    loadChildren: () => import('./features/results/results.routes').then(m => m.RESULTS_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER'] }
  },

  // Reporting
  { path: 'reporting', loadChildren: () => import('./features/reporting/reporting.routes').then(m => m.REPORTING_ROUTES) },

  // Analytics
  { path: 'analytics', loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES) },

  // Certificates
  {
    path: 'certificates',
    loadChildren: () => import('./features/certificates/certificates.routes').then(m => m.CERTIFICATES_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CANDIDATE'] }
  },

  // Dashboard (home)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent),
    canActivate: [authGuard]
  },

  // Legacy redirects
  { path: 'assessment', redirectTo: 'authoring', pathMatch: 'full' },

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];