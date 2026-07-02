import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const RESULTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/results-dashboard-page.component').then(m => m.ResultsDashboardPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER'] }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/dashboard/results-dashboard-page.component').then(m => m.ResultsDashboardPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER'] }
  },
  {
    path: 'reviewer-dashboard',
    loadComponent: () => import('./pages/reviewer-dashboard/reviewer-dashboard-page.component').then(m => m.ReviewerDashboardPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['REVIEWER', 'ASSESSMENT_MANAGER', 'PLATFORM_ADMIN', 'CLIENT_ADMIN'] }
  },
  {
    path: 'manual',
    loadComponent: () => import('./pages/manual-review/manual-review-page.component').then(m => m.ManualReviewPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER'] }
  },
  {
    path: 'candidate',
    loadComponent: () => import('./pages/candidate/candidate-results-page.component').then(m => m.CandidateResultsPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['CANDIDATE', 'PLATFORM_ADMIN', 'CLIENT_ADMIN'] }
  },
  {
    path: ':uuid',
    loadComponent: () => import('./pages/detail/result-detail-page.component').then(m => m.ResultDetailPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CANDIDATE'] }
  },
  {
    path: ':uuid/versions',
    loadComponent: () => import('./pages/version/result-version-page.component').then(m => m.ResultVersionPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CANDIDATE'] }
  },
  {
    path: ':uuid/publication',
    loadComponent: () => import('./pages/publication/result-publication-page.component').then(m => m.ResultPublicationPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CANDIDATE'] }
  },
  {
    path: ':uuid/manual-review',
    loadComponent: () => import('./pages/manual-review/manual-review-page.component').then(m => m.ManualReviewPageComponent),
    canActivate: [roleGuard],
    data: { roles: ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER'] }
  }
];