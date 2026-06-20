const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/results/pages/dashboard',
    'features/results/pages/detail',
    'features/results/pages/version',
    'features/results/pages/publication',
    'features/results/pages/manual-review',
    'features/results/components/score-card',
    'features/results/components/competency-breakdown',
    'features/results/components/version-history',
    'features/results/components/publication-panel',
    'features/results/components/manual-review-form',
    'features/results/components/question-score-viewer',
    'features/results/components/section-score-viewer',
    'features/results/components/result-status-badge',
    'features/results/facades',
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
writeTsFile('shared/stores/results.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ResultsStore {\n" +
"  private readonly _results = signal<any[]>([]);\n" +
"  private readonly _currentResult = signal<any | null>(null);\n" +
"  public readonly results = this._results.asReadonly();\n" +
"  public readonly currentResult = this._currentResult.asReadonly();\n" +
"  public setResults(data: any[]): void { this._results.set(data); }\n" +
"  public setCurrentResult(data: any): void { this._currentResult.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/result-version.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ResultVersionStore {\n" +
"  private readonly _versions = signal<any[]>([]);\n" +
"  public readonly versions = this._versions.asReadonly();\n" +
"  public setVersions(data: any[]): void { this._versions.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/publication.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class PublicationStore {\n" +
"  private readonly _publication = signal<any | null>(null);\n" +
"  public readonly publication = this._publication.asReadonly();\n" +
"  public setPublication(data: any): void { this._publication.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/manual-review.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ManualReviewStore {\n" +
"  private readonly _reviews = signal<any[]>([]);\n" +
"  public readonly reviews = this._reviews.asReadonly();\n" +
"  public setReviews(data: any[]): void { this._reviews.set(data); }\n" +
"}\n"
);

// --- API SERVICE ---
writeTsFile('core/api/results-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ResultsApiService extends BaseApiService {\n" +
"  public getResults(): Observable<any> { return this.http.get(this.baseUrl + '/results'); }\n" +
"  public getResult(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid); }\n" +
"  public getVersions(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/versions'); }\n" +
"  public getPublication(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/publication'); }\n" +
"  public getManualReviews(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/manual-reviews'); }\n" +
"}\n"
);

// --- FACADE ---
writeTsFile('features/results/facades/results.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { ResultsApiService } from '../../../core/api/results-api.service';\n" +
"import { ResultsStore } from '../../../shared/stores/results.store';\n" +
"import { ResultVersionStore } from '../../../shared/stores/result-version.store';\n" +
"import { PublicationStore } from '../../../shared/stores/publication.store';\n" +
"import { ManualReviewStore } from '../../../shared/stores/manual-review.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ResultsFacade {\n" +
"  private api = inject(ResultsApiService);\n" +
"  private resultsStore = inject(ResultsStore);\n" +
"  private versionStore = inject(ResultVersionStore);\n" +
"  private publicationStore = inject(PublicationStore);\n" +
"  private manualReviewStore = inject(ManualReviewStore);\n" +
"  public loadResults() { return this.api.getResults().pipe(tap(res => this.resultsStore.setResults(res.data))); }\n" +
"  public loadResult(uuid: string) { return this.api.getResult(uuid).pipe(tap(res => this.resultsStore.setCurrentResult(res.data))); }\n" +
"  public loadVersions(uuid: string) { return this.api.getVersions(uuid).pipe(tap(res => this.versionStore.setVersions(res.data))); }\n" +
"  public loadPublication(uuid: string) { return this.api.getPublication(uuid).pipe(tap(res => this.publicationStore.setPublication(res.data))); }\n" +
"  public loadManualReviews(uuid: string) { return this.api.getManualReviews(uuid).pipe(tap(res => this.manualReviewStore.setReviews(res.data))); }\n" +
"}\n"
);

// --- COMPONENTS ---
const components = [
  'score-card', 
  'competency-breakdown', 
  'version-history', 
  'publication-panel', 
  'manual-review-form', 
  'question-score-viewer', 
  'section-score-viewer', 
  'result-status-badge'
];
components.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/results/components/' + c + '/' + c + '.component.ts', 
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
    { dir: 'dashboard', file: 'results-dashboard-page' },
    { dir: 'detail', file: 'result-detail-page' },
    { dir: 'version', file: 'result-version-page' },
    { dir: 'publication', file: 'result-publication-page' },
    { dir: 'manual-review', file: 'manual-review-page' }
];

pages.forEach(p => {
    const className = p.file.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
    writeTsFile('features/results/pages/' + p.dir + '/' + p.file + '.component.ts', 
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
writeTsFile('features/results/results.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { ResultsDashboardPageComponent } from './pages/dashboard/results-dashboard-page.component';\n" +
"import { ResultDetailPageComponent } from './pages/detail/result-detail-page.component';\n" +
"import { ResultVersionPageComponent } from './pages/version/result-version-page.component';\n" +
"import { ResultPublicationPageComponent } from './pages/publication/result-publication-page.component';\n" +
"import { ManualReviewPageComponent } from './pages/manual-review/manual-review-page.component';\n" +
"\n" +
"export const RESULTS_ROUTES: Routes = [\n" +
"  { path: '', component: ResultsDashboardPageComponent },\n" +
"  { path: ':uuid', component: ResultDetailPageComponent },\n" +
"  { path: ':uuid/versions', component: ResultVersionPageComponent },\n" +
"  { path: ':uuid/publication', component: ResultPublicationPageComponent },\n" +
"  { path: ':uuid/manual-review', component: ManualReviewPageComponent }\n" +
"];\n"
);

console.log('Sprint 05 Phase 7 Results UI generated successfully.');
