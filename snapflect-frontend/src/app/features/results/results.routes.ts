import { Routes } from '@angular/router';

export const RESULTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/results-dashboard-page.component').then(m => m.ResultsDashboardPageComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/dashboard/results-dashboard-page.component').then(m => m.ResultsDashboardPageComponent)
  },
  {
    path: 'manual',
    loadComponent: () => import('./pages/manual-review/manual-review-page.component').then(m => m.ManualReviewPageComponent)
  },
  {
    path: 'candidate',
    loadComponent: () => import('./pages/dashboard/results-dashboard-page.component').then(m => m.ResultsDashboardPageComponent)
  },
  {
    path: ':uuid',
    loadComponent: () => import('./pages/detail/result-detail-page.component').then(m => m.ResultDetailPageComponent)
  },
  {
    path: ':uuid/versions',
    loadComponent: () => import('./pages/version/result-version-page.component').then(m => m.ResultVersionPageComponent)
  },
  {
    path: ':uuid/publication',
    loadComponent: () => import('./pages/publication/result-publication-page.component').then(m => m.ResultPublicationPageComponent)
  },
  {
    path: ':uuid/manual-review',
    loadComponent: () => import('./pages/manual-review/manual-review-page.component').then(m => m.ManualReviewPageComponent)
  }
];