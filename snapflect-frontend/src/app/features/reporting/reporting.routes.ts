import { Routes } from '@angular/router';
import { AssessmentReportPageComponent } from './pages/assessment-report/assessment-report-page.component';
import { CompetencyReportPageComponent } from './pages/competency-report/competency-report-page.component';
import { PassFailReportPageComponent } from './pages/pass-fail-report/pass-fail-report-page.component';
import { CandidateReportPageComponent } from './pages/candidate-report/candidate-report-page.component';

export const REPORTING_ROUTES: Routes = [
  { path: 'assessments', component: AssessmentReportPageComponent },
  { path: 'competencies', component: CompetencyReportPageComponent },
  { path: 'pass-fail', component: PassFailReportPageComponent },
  { path: 'candidates', component: CandidateReportPageComponent },
  { path: '', redirectTo: 'assessments', pathMatch: 'full' }
];