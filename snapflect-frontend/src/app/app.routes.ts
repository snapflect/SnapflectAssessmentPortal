import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'governance', loadChildren: () => import('./features/governance/governance.routes').then(m => m.GOVERNANCE_ROUTES) },
  { path: 'assessment', loadChildren: () => import('./features/assessment/assessment.routes').then(m => m.ASSESSMENT_ROUTES) },
  { path: 'delivery', loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES) },
  { path: 'results', loadChildren: () => import('./features/results/results.routes').then(m => m.RESULTS_ROUTES) },
  { path: 'reporting', loadChildren: () => import('./features/reporting/reporting.routes').then(m => m.REPORTING_ROUTES) },
  { path: 'analytics', loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES) },
  { path: 'certificates', loadChildren: () => import('./features/certificates/certificates.routes').then(m => m.CERTIFICATES_ROUTES) },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }
];