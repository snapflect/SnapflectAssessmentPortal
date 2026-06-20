import { Routes } from '@angular/router';
import { ResultsDashboardPageComponent } from './pages/dashboard/results-dashboard-page.component';
import { ResultDetailPageComponent } from './pages/detail/result-detail-page.component';
import { ResultVersionPageComponent } from './pages/version/result-version-page.component';
import { ResultPublicationPageComponent } from './pages/publication/result-publication-page.component';
import { ManualReviewPageComponent } from './pages/manual-review/manual-review-page.component';

export const RESULTS_ROUTES: Routes = [
  { path: '', component: ResultsDashboardPageComponent },
  { path: ':uuid', component: ResultDetailPageComponent },
  { path: ':uuid/versions', component: ResultVersionPageComponent },
  { path: ':uuid/publication', component: ResultPublicationPageComponent },
  { path: ':uuid/manual-review', component: ManualReviewPageComponent }
];