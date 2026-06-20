const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/delivery/pages/candidate-dashboard',
    'features/delivery/pages/session/list',
    'features/delivery/pages/session/detail',
    'features/delivery/pages/attempt/start',
    'features/delivery/pages/attempt/question',
    'features/delivery/pages/attempt/summary',
    'features/delivery/pages/attempt/submission',
    'features/delivery/components/question-navigator',
    'features/delivery/components/attempt-timer',
    'features/delivery/components/progress-tracker',
    'features/delivery/components/answer-panel',
    'features/delivery/components/question-renderer',
    'features/delivery/components/question-header',
    'features/delivery/components/session-card',
    'features/delivery/components/attempt-summary',
    'features/delivery/components/submission-confirmation-dialog',
    'features/delivery/facades',
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
writeTsFile('shared/stores/delivery.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class DeliveryStore {\n" +
"  private readonly _state = signal<any | null>(null);\n" +
"  public readonly state = this._state.asReadonly();\n" +
"  public setState(data: any): void { this._state.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/attempt.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AttemptStore {\n" +
"  private readonly _currentAttempt = signal<any | null>(null);\n" +
"  private readonly _answers = signal<Record<string, any>>({});\n" +
"  public readonly currentAttempt = this._currentAttempt.asReadonly();\n" +
"  public readonly answers = this._answers.asReadonly();\n" +
"  public setCurrentAttempt(data: any): void { this._currentAttempt.set(data); }\n" +
"  public setAnswer(questionUuid: string, answer: any): void {\n" +
"    this._answers.update(a => ({ ...a, [questionUuid]: answer }));\n" +
"  }\n" +
"}\n"
);

writeTsFile('shared/stores/session.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class SessionStore {\n" +
"  private readonly _sessions = signal<any[]>([]);\n" +
"  public readonly sessions = this._sessions.asReadonly();\n" +
"  public setSessions(data: any[]): void { this._sessions.set(data); }\n" +
"}\n"
);

// We already have a QuestionStore from Assessment Phase, but we might extend or just rely on it. Let's make a delivery-specific alias or just assume the user means `DeliveryQuestionStore` or just overwriting the generic one safely. For isolation, let's call it DeliveryQuestionStore. Actually, the prompt says "QuestionStore". We will just re-declare it to ensure it has delivery context if needed, or leave it as it was if it exists. Since the script overwrites, let's just create a basic one.
writeTsFile('shared/stores/delivery-question.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class DeliveryQuestionStore {\n" +
"  private readonly _questions = signal<any[]>([]);\n" +
"  private readonly _currentIndex = signal<number>(0);\n" +
"  public readonly questions = this._questions.asReadonly();\n" +
"  public readonly currentIndex = this._currentIndex.asReadonly();\n" +
"  public setQuestions(data: any[]): void { this._questions.set(data); }\n" +
"  public setCurrentIndex(idx: number): void { this._currentIndex.set(idx); }\n" +
"}\n"
);

// --- API SERVICE ---
writeTsFile('core/api/delivery-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class DeliveryApiService extends BaseApiService {\n" +
"  public getSessions(): Observable<any> { return this.http.get(this.baseUrl + '/delivery/sessions'); }\n" +
"  public startAttempt(sessionUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/sessions/' + sessionUuid + '/attempts', {}); }\n" +
"  public getAttempt(attemptUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/delivery/attempts/' + attemptUuid); }\n" +
"  public saveAnswer(attemptUuid: string, payload: any): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/answers', payload); }\n" +
"  public submitAttempt(attemptUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/submit', {}); }\n" +
"}\n"
);

// --- FACADE ---
writeTsFile('features/delivery/facades/delivery.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { DeliveryApiService } from '../../../core/api/delivery-api.service';\n" +
"import { SessionStore } from '../../../shared/stores/session.store';\n" +
"import { AttemptStore } from '../../../shared/stores/attempt.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class DeliveryFacade {\n" +
"  private api = inject(DeliveryApiService);\n" +
"  private sessionStore = inject(SessionStore);\n" +
"  private attemptStore = inject(AttemptStore);\n" +
"  public loadSessions() { return this.api.getSessions().pipe(tap(res => this.sessionStore.setSessions(res.data))); }\n" +
"  public startAttempt(uuid: string) { return this.api.startAttempt(uuid).pipe(tap(res => this.attemptStore.setCurrentAttempt(res.data))); }\n" +
"  public saveAnswer(uuid: string, payload: any) { return this.api.saveAnswer(uuid, payload); }\n" +
"  public submitAttempt(uuid: string) { return this.api.submitAttempt(uuid); }\n" +
"}\n"
);

// --- COMPONENTS ---
const components = [
  'question-navigator', 
  'attempt-timer', 
  'progress-tracker', 
  'answer-panel', 
  'question-renderer', 
  'question-header', 
  'session-card', 
  'attempt-summary',
  'submission-confirmation-dialog'
];
components.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/delivery/components/' + c + '/' + c + '.component.ts', 
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
    { dir: 'candidate-dashboard', file: 'candidate-dashboard-page' },
    { dir: 'session/list', file: 'session-list-page' },
    { dir: 'session/detail', file: 'session-detail-page' },
    { dir: 'attempt/start', file: 'attempt-start-page' },
    { dir: 'attempt/question', file: 'attempt-question-page' },
    { dir: 'attempt/summary', file: 'attempt-summary-page' },
    { dir: 'attempt/submission', file: 'attempt-submission-page' }
];

pages.forEach(p => {
    const className = p.file.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
    writeTsFile('features/delivery/pages/' + p.dir + '/' + p.file + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + p.file + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- ROUTING ---
writeTsFile('features/delivery/delivery.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { CandidateDashboardPageComponent } from './pages/candidate-dashboard/candidate-dashboard-page.component';\n" +
"import { SessionListPageComponent } from './pages/session/list/session-list-page.component';\n" +
"import { AttemptStartPageComponent } from './pages/attempt/start/attempt-start-page.component';\n" +
"import { AttemptQuestionPageComponent } from './pages/attempt/question/attempt-question-page.component';\n" +
"import { AttemptSummaryPageComponent } from './pages/attempt/summary/attempt-summary-page.component';\n" +
"import { AttemptSubmissionPageComponent } from './pages/attempt/submission/attempt-submission-page.component';\n" +
"\n" +
"export const DELIVERY_ROUTES: Routes = [\n" +
"  { path: 'dashboard', component: CandidateDashboardPageComponent },\n" +
"  { path: 'sessions', component: SessionListPageComponent },\n" +
"  { path: 'attempts', component: AttemptStartPageComponent },\n" +
"  { path: 'attempts/:uuid', component: AttemptQuestionPageComponent },\n" +
"  { path: 'attempts/:uuid/summary', component: AttemptSummaryPageComponent },\n" +
"  { path: 'attempts/:uuid/submission', component: AttemptSubmissionPageComponent },\n" +
"  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }\n" +
"];\n"
);

console.log('Sprint 05 Phase 6 Delivery UI generated successfully.');
