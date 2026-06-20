import { Routes } from '@angular/router';
import { AssessmentTrendPageComponent } from './pages/assessment-trend/assessment-trend-page.component';
import { CompletionMetricsPageComponent } from './pages/completion-metrics/completion-metrics-page.component';
import { CompetencyHeatmapPageComponent } from './pages/competency-heatmap/competency-heatmap-page.component';
import { ScoreDistributionPageComponent } from './pages/score-distribution/score-distribution-page.component';

export const ANALYTICS_ROUTES: Routes = [
  { path: 'trends', component: AssessmentTrendPageComponent },
  { path: 'completion', component: CompletionMetricsPageComponent },
  { path: 'heatmaps', component: CompetencyHeatmapPageComponent },
  { path: 'distribution', component: ScoreDistributionPageComponent },
  { path: '', redirectTo: 'trends', pathMatch: 'full' }
];