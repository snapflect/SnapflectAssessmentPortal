import { Routes } from '@angular/router';
import { CandidateDashboardPageComponent } from './pages/candidate-dashboard/candidate-dashboard-page.component';
import { SessionListPageComponent } from './pages/session/list/session-list-page.component';
import { AttemptStartPageComponent } from './pages/attempt/start/attempt-start-page.component';
import { AttemptQuestionPageComponent } from './pages/attempt/question/attempt-question-page.component';
import { AttemptSummaryPageComponent } from './pages/attempt/summary/attempt-summary-page.component';
import { AttemptSubmissionPageComponent } from './pages/attempt/submission/attempt-submission-page.component';

export const DELIVERY_ROUTES: Routes = [
  { path: 'dashboard', component: CandidateDashboardPageComponent },
  { path: 'sessions', component: SessionListPageComponent },
  { path: 'attempts', component: AttemptStartPageComponent },
  { path: 'attempts/:uuid', component: AttemptQuestionPageComponent },
  { path: 'attempts/:uuid/summary', component: AttemptSummaryPageComponent },
  { path: 'attempts/:uuid/submission', component: AttemptSubmissionPageComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];