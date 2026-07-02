import { Routes } from '@angular/router';

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: 'assessments',
    loadComponent: () => import('./pages/assessment/list/assessment-list-page.component').then(m => m.AssessmentListPageComponent)
  },
  {
    path: 'question-banks',
    loadComponent: () => import('./pages/question-bank/list/question-bank-list-page.component').then(m => m.QuestionBankListPageComponent)
  },
  {
    path: 'questions',
    loadComponent: () => import('./pages/question/list/question-list-page.component').then(m => m.QuestionListPageComponent)
  },
  {
    path: 'competencies',
    loadComponent: () => import('./pages/competency/list/competency-list-page.component').then(m => m.CompetencyListPageComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/category/list/category-list-page.component').then(m => m.CategoryListPageComponent)
  },
  {
    path: 'types',
    loadComponent: () => import('./pages/type/list/type-list-page.component').then(m => m.TypeListPageComponent)
  },
  {
    path: 'blueprints',
    loadComponent: () => import('./pages/blueprint/designer/blueprint-designer-page.component').then(m => m.BlueprintDesignerPageComponent)
  },
  {
    path: 'publications',
    loadComponent: () => import('./pages/publication/list/publication-list-page.component').then(m => m.PublicationListPageComponent)
  },
  { path: '', redirectTo: 'assessments', pathMatch: 'full' }
];