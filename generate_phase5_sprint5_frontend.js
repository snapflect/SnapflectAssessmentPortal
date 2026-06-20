const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/assessment/pages/assessment/list',
    'features/assessment/pages/assessment/create',
    'features/assessment/pages/assessment/edit',
    'features/assessment/pages/assessment/detail',
    'features/assessment/pages/question-bank/list',
    'features/assessment/pages/question-bank/detail',
    'features/assessment/pages/question/list',
    'features/assessment/pages/question/create',
    'features/assessment/pages/question/edit',
    'features/assessment/pages/competency/list',
    'features/assessment/pages/competency/create',
    'features/assessment/pages/competency/edit',
    'features/assessment/pages/blueprint/designer',
    'features/assessment/pages/blueprint/section',
    'features/assessment/pages/publication/history',
    'features/assessment/components/assessment-form',
    'features/assessment/components/question-bank-selector',
    'features/assessment/components/question-form',
    'features/assessment/components/competency-form',
    'features/assessment/components/blueprint-designer',
    'features/assessment/components/blueprint-section',
    'features/assessment/components/blueprint-rule',
    'features/assessment/components/publication-history',
    'features/assessment/facades',
    'core/api',
    'shared/stores'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- STORES ---
writeTsFile('shared/stores/assessment.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AssessmentStore {\n" +
"  private readonly _assessments = signal<any[]>([]);\n" +
"  public readonly assessments = this._assessments.asReadonly();\n" +
"  public setAssessments(data: any[]): void { this._assessments.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/question-bank.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class QuestionBankStore {\n" +
"  private readonly _questionBanks = signal<any[]>([]);\n" +
"  public readonly questionBanks = this._questionBanks.asReadonly();\n" +
"  public setQuestionBanks(data: any[]): void { this._questionBanks.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/question.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class QuestionStore {\n" +
"  private readonly _questions = signal<any[]>([]);\n" +
"  public readonly questions = this._questions.asReadonly();\n" +
"  public setQuestions(data: any[]): void { this._questions.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/competency.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class CompetencyStore {\n" +
"  private readonly _competencies = signal<any[]>([]);\n" +
"  public readonly competencies = this._competencies.asReadonly();\n" +
"  public setCompetencies(data: any[]): void { this._competencies.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/blueprint.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class BlueprintStore {\n" +
"  private readonly _blueprints = signal<any[]>([]);\n" +
"  public readonly blueprints = this._blueprints.asReadonly();\n" +
"  public setBlueprints(data: any[]): void { this._blueprints.set(data); }\n" +
"}\n"
);

// --- API SERVICE ---
writeTsFile('core/api/assessment-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AssessmentApiService extends BaseApiService {\n" +
"  public getAssessments(): Observable<any> { return this.http.get(this.baseUrl + '/assessments'); }\n" +
"  public getQuestionBanks(): Observable<any> { return this.http.get(this.baseUrl + '/question-banks'); }\n" +
"  public getQuestions(): Observable<any> { return this.http.get(this.baseUrl + '/questions'); }\n" +
"  public getCompetencies(): Observable<any> { return this.http.get(this.baseUrl + '/competencies'); }\n" +
"  public getBlueprints(): Observable<any> { return this.http.get(this.baseUrl + '/blueprints'); }\n" +
"  public getPublications(assessmentUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/assessments/' + assessmentUuid + '/publications'); }\n" +
"}\n"
);

// --- FACADE ---
writeTsFile('features/assessment/facades/assessment.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { AssessmentApiService } from '../../../core/api/assessment-api.service';\n" +
"import { AssessmentStore } from '../../../shared/stores/assessment.store';\n" +
"import { QuestionBankStore } from '../../../shared/stores/question-bank.store';\n" +
"import { QuestionStore } from '../../../shared/stores/question.store';\n" +
"import { CompetencyStore } from '../../../shared/stores/competency.store';\n" +
"import { BlueprintStore } from '../../../shared/stores/blueprint.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AssessmentFacade {\n" +
"  private api = inject(AssessmentApiService);\n" +
"  private assessmentStore = inject(AssessmentStore);\n" +
"  private qbStore = inject(QuestionBankStore);\n" +
"  private qStore = inject(QuestionStore);\n" +
"  private compStore = inject(CompetencyStore);\n" +
"  private bpStore = inject(BlueprintStore);\n" +
"  public loadAssessments() { return this.api.getAssessments().pipe(tap(res => this.assessmentStore.setAssessments(res.data))); }\n" +
"  public loadQuestionBanks() { return this.api.getQuestionBanks().pipe(tap(res => this.qbStore.setQuestionBanks(res.data))); }\n" +
"  public loadQuestions() { return this.api.getQuestions().pipe(tap(res => this.qStore.setQuestions(res.data))); }\n" +
"  public loadCompetencies() { return this.api.getCompetencies().pipe(tap(res => this.compStore.setCompetencies(res.data))); }\n" +
"  public loadBlueprints() { return this.api.getBlueprints().pipe(tap(res => this.bpStore.setBlueprints(res.data))); }\n" +
"}\n"
);

// --- COMPONENTS ---
const components = [
  'assessment-form', 
  'question-bank-selector', 
  'question-form', 
  'competency-form', 
  'blueprint-designer', 
  'blueprint-section', 
  'blueprint-rule', 
  'publication-history'
];
components.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/assessment/components/' + c + '/' + c + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + c + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- PAGES ---
const pages = [
    { entity: 'assessment', actions: ['list', 'create', 'edit', 'detail'] },
    { entity: 'question-bank', actions: ['list', 'detail'] },
    { entity: 'question', actions: ['list', 'create', 'edit'] },
    { entity: 'competency', actions: ['list', 'create', 'edit'] },
    { entity: 'blueprint', actions: ['designer', 'section'] },
    { entity: 'publication', actions: ['history'] }
];

pages.forEach(p => {
    p.actions.forEach(a => {
        const componentName = p.entity + '-' + a + '-page';
        const className = p.entity.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + a.charAt(0).toUpperCase() + a.slice(1) + 'PageComponent';
        writeTsFile('features/assessment/pages/' + p.entity + '/' + a + '/' + componentName + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + componentName + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
        );
    });
});

// --- ROUTING ---
writeTsFile('features/assessment/assessment.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { AssessmentListPageComponent } from './pages/assessment/list/assessment-list-page.component';\n" +
"import { QuestionBankListPageComponent } from './pages/question-bank/list/question-bank-list-page.component';\n" +
"import { QuestionListPageComponent } from './pages/question/list/question-list-page.component';\n" +
"import { CompetencyListPageComponent } from './pages/competency/list/competency-list-page.component';\n" +
"import { BlueprintDesignerPageComponent } from './pages/blueprint/designer/blueprint-designer-page.component';\n" +
"\n" +
"export const ASSESSMENT_ROUTES: Routes = [\n" +
"  { path: 'assessments', component: AssessmentListPageComponent },\n" +
"  { path: 'question-banks', component: QuestionBankListPageComponent },\n" +
"  { path: 'questions', component: QuestionListPageComponent },\n" +
"  { path: 'competencies', component: CompetencyListPageComponent },\n" +
"  { path: 'blueprints', component: BlueprintDesignerPageComponent },\n" +
"  { path: '', redirectTo: 'assessments', pathMatch: 'full' }\n" +
"];\n"
);

console.log('Sprint 05 Phase 5 Assessment UI generated successfully.');
