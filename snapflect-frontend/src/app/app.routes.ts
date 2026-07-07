import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  // ─── Public (Unauthenticated) Routes ────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'delivery/register/:publication_code',
    loadComponent: () => import('./features/delivery/pages/public-registration/public-registration-page.component').then(m => m.PublicRegistrationPageComponent)
  },

  // ─── Authenticated App Shell ─────────────────────────────────────────────────
  // All authenticated routes live as children of AppShellComponent.
  // This means one <router-outlet> in AppShell renders all page content.
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/components/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [

      // Default redirect to role-specific dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Platform/Admin Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent),
        canActivate: [roleGuard],
        data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'SUPPORT', 'BILLING_ADMIN', 'READ_ONLY', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER', 'PROCTOR', 'CANDIDATE'] }
      },

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
        data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR', 'REVIEWER', 'READ_ONLY'] }
      },

      // Delivery: Candidate Dashboard, Sessions/Proctoring, Attempt runner
      {
        path: 'delivery',
        loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'PROCTOR', 'SUPPORT', 'CANDIDATE', 'ASSESSMENT_MANAGER', 'READ_ONLY'] }
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
        data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER', 'READ_ONLY'] }
      },

      // Reporting
      {
        path: 'reporting',
        loadChildren: () => import('./features/reporting/reporting.routes').then(m => m.REPORTING_ROUTES)
      },

      // Analytics
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES)
      },

      // Certificates
      {
        path: 'certificates',
        loadChildren: () => import('./features/certificates/certificates.routes').then(m => m.CERTIFICATES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CANDIDATE'] }
      },

      // Support / Helpdesk
      {
        path: 'support',
        loadChildren: () => import('./features/support/support.routes').then(m => m.SUPPORT_ROUTES),
        canActivate: [roleGuard]
      },

      // Legacy redirects
      { path: 'assessment', redirectTo: 'authoring', pathMatch: 'full' },
    ]
  },

];