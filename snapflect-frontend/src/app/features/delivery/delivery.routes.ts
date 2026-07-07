import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DELIVERY_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/candidate-dashboard/candidate-dashboard-page.component').then(m => m.CandidateDashboardPageComponent)
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/session/list/session-list-page.component').then(m => m.SessionListPageComponent)
  },
  {
    path: 'monitor',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/session-monitor/session-monitor-page.component').then(m => m.SessionMonitorPageComponent)
  },
  {
    path: 'proctoring',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/proctoring/proctoring-page.component').then(m => m.ProctoringPageComponent)
  },
  {
    path: 'attempts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/attempt/start/attempt-start-page.component').then(m => m.AttemptStartPageComponent)
  },
  {
    path: 'attempts/:uuid',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/attempt/question/attempt-question-page.component').then(m => m.AttemptQuestionPageComponent)
  },
  {
    path: 'attempts/:uuid/summary',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/attempt/summary/attempt-summary-page.component').then(m => m.AttemptSummaryPageComponent)
  },
  {
    path: 'attempts/:uuid/submission',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/attempt/submission/attempt-submission-page.component').then(m => m.AttemptSubmissionPageComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];