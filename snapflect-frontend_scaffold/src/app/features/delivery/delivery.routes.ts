import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { CandidateDashboardPageComponent } from './pages/candidate-dashboard/candidate-dashboard-page.component';
import { SessionListPageComponent } from './pages/session/list/session-list-page.component';
import { AttemptStartPageComponent } from './pages/attempt/start/attempt-start-page.component';
import { AttemptQuestionPageComponent } from './pages/attempt/question/attempt-question-page.component';
import { AttemptSummaryPageComponent } from './pages/attempt/summary/attempt-summary-page.component';
import { AttemptSubmissionPageComponent } from './pages/attempt/submission/attempt-submission-page.component';
import { DeliveryFacade } from './facades/delivery.facade';
import { DeliveryStore } from './store/delivery.store';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const attemptResolver = (route: any) => {
  const facade = inject(DeliveryFacade);
  return facade.resumeAttempt(route.paramMap.get('uuid')!).pipe(
    catchError(() => of(null)) // In a real app we'd redirect to error
  );
};

const submissionGuard = () => {
  const store = inject(DeliveryStore);
  return store.status() === 'SUBMITTED';
};

export const DELIVERY_ROUTES: Routes = [
  { path: 'dashboard', component: CandidateDashboardPageComponent },
  { path: 'sessions', component: SessionListPageComponent },
  { path: 'attempts', component: AttemptStartPageComponent },
  { 
    path: 'attempts/:uuid', 
    component: AttemptQuestionPageComponent,
    resolve: { attempt: attemptResolver }
  },
  { 
    path: 'attempts/:uuid/summary', 
    component: AttemptSummaryPageComponent,
    resolve: { attempt: attemptResolver }
  },
  { 
    path: 'attempts/:uuid/submission', 
    component: AttemptSubmissionPageComponent,
    canActivate: [submissionGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];