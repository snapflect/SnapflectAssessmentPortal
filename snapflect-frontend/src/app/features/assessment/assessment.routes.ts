import { Routes } from '@angular/router';
import { AssessmentListPageComponent } from './pages/assessment/list/assessment-list-page.component';
import { QuestionBankListPageComponent } from './pages/question-bank/list/question-bank-list-page.component';
import { QuestionListPageComponent } from './pages/question/list/question-list-page.component';
import { CompetencyListPageComponent } from './pages/competency/list/competency-list-page.component';
import { BlueprintDesignerPageComponent } from './pages/blueprint/designer/blueprint-designer-page.component';

export const ASSESSMENT_ROUTES: Routes = [
  { path: 'assessments', component: AssessmentListPageComponent },
  { path: 'question-banks', component: QuestionBankListPageComponent },
  { path: 'questions', component: QuestionListPageComponent },
  { path: 'competencies', component: CompetencyListPageComponent },
  { path: 'blueprints', component: BlueprintDesignerPageComponent },
  { path: '', redirectTo: 'assessments', pathMatch: 'full' }
];