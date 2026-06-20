const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/reporting/pages/assessment-report',
    'features/reporting/pages/competency-report',
    'features/reporting/pages/pass-fail-report',
    'features/reporting/pages/candidate-report',
    'features/reporting/components/report-filters',
    'features/reporting/components/report-table',
    'features/reporting/components/report-export-panel',
    'features/reporting/components/report-summary-card',
    'features/reporting/components/report-date-range',
    'features/reporting/facades',
    
    'features/analytics/pages/assessment-trend',
    'features/analytics/pages/completion-metrics',
    'features/analytics/pages/competency-heatmap',
    'features/analytics/pages/score-distribution',
    'features/analytics/components/trend-chart',
    'features/analytics/components/heatmap',
    'features/analytics/components/distribution-chart',
    'features/analytics/components/analytics-dashboard',
    'features/analytics/components/kpi-metrics',
    'features/analytics/facades',
    
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
writeTsFile('shared/stores/reporting.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ReportingStore {\n" +
"  private readonly _reports = signal<any[]>([]);\n" +
"  public readonly reports = this._reports.asReadonly();\n" +
"  public setReports(data: any[]): void { this._reports.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/analytics.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AnalyticsStore {\n" +
"  private readonly _metrics = signal<any | null>(null);\n" +
"  public readonly metrics = this._metrics.asReadonly();\n" +
"  public setMetrics(data: any): void { this._metrics.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/dashboard.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class DashboardStore {\n" +
"  private readonly _kpis = signal<any | null>(null);\n" +
"  public readonly kpis = this._kpis.asReadonly();\n" +
"  public setKpis(data: any): void { this._kpis.set(data); }\n" +
"}\n"
);

// --- API SERVICES ---
writeTsFile('core/api/reporting-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ReportingApiService extends BaseApiService {\n" +
"  public getAssessmentReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/assessments', { params }); }\n" +
"  public getCompetencyReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/competencies', { params }); }\n" +
"  public getPassFailReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/pass-fail', { params }); }\n" +
"  public getCandidateReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/candidates', { params }); }\n" +
"  public exportCsv(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/export/csv', { params, responseType: 'blob' }); }\n" +
"}\n"
);

writeTsFile('core/api/analytics-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AnalyticsApiService extends BaseApiService {\n" +
"  public getAssessmentTrends(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/trends', { params }); }\n" +
"  public getCompletionMetrics(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/completion', { params }); }\n" +
"  public getCompetencyHeatmaps(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/heatmaps', { params }); }\n" +
"  public getScoreDistribution(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/distribution', { params }); }\n" +
"}\n"
);

// --- FACADES ---
writeTsFile('features/reporting/facades/reporting.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { ReportingApiService } from '../../../core/api/reporting-api.service';\n" +
"import { ReportingStore } from '../../../shared/stores/reporting.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class ReportingFacade {\n" +
"  private api = inject(ReportingApiService);\n" +
"  private store = inject(ReportingStore);\n" +
"  public loadAssessmentReport(params: any) { return this.api.getAssessmentReport(params).pipe(tap(res => this.store.setReports(res.data))); }\n" +
"  public exportCsv(params: any) { return this.api.exportCsv(params); }\n" +
"}\n"
);

writeTsFile('features/analytics/facades/analytics.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { AnalyticsApiService } from '../../../core/api/analytics-api.service';\n" +
"import { AnalyticsStore } from '../../../shared/stores/analytics.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class AnalyticsFacade {\n" +
"  private api = inject(AnalyticsApiService);\n" +
"  private store = inject(AnalyticsStore);\n" +
"  public loadAssessmentTrends(params: any) { return this.api.getAssessmentTrends(params).pipe(tap(res => this.store.setMetrics(res.data))); }\n" +
"}\n"
);

// --- REPORTING COMPONENTS ---
const reportingComponents = ['report-filters', 'report-table', 'report-export-panel', 'report-summary-card', 'report-date-range'];
reportingComponents.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/reporting/components/' + c + '/' + c + '.component.ts', 
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

// --- REPORTING PAGES ---
const reportingPages = ['assessment-report', 'competency-report', 'pass-fail-report', 'candidate-report'];
reportingPages.forEach(p => {
    const className = p.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'PageComponent';
    writeTsFile('features/reporting/pages/' + p + '/' + p + '-page.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + p + "-page',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- ANALYTICS COMPONENTS ---
const analyticsComponents = ['trend-chart', 'heatmap', 'distribution-chart', 'analytics-dashboard', 'kpi-metrics'];
analyticsComponents.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/analytics/components/' + c + '/' + c + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + c + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded (ApexCharts integration ready)</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- ANALYTICS PAGES ---
const analyticsPages = ['assessment-trend', 'completion-metrics', 'competency-heatmap', 'score-distribution'];
analyticsPages.forEach(p => {
    const className = p.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'PageComponent';
    writeTsFile('features/analytics/pages/' + p + '/' + p + '-page.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + p + "-page',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- ROUTING ---
writeTsFile('features/reporting/reporting.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { AssessmentReportPageComponent } from './pages/assessment-report/assessment-report-page.component';\n" +
"import { CompetencyReportPageComponent } from './pages/competency-report/competency-report-page.component';\n" +
"import { PassFailReportPageComponent } from './pages/pass-fail-report/pass-fail-report-page.component';\n" +
"import { CandidateReportPageComponent } from './pages/candidate-report/candidate-report-page.component';\n" +
"\n" +
"export const REPORTING_ROUTES: Routes = [\n" +
"  { path: 'assessments', component: AssessmentReportPageComponent },\n" +
"  { path: 'competencies', component: CompetencyReportPageComponent },\n" +
"  { path: 'pass-fail', component: PassFailReportPageComponent },\n" +
"  { path: 'candidates', component: CandidateReportPageComponent },\n" +
"  { path: '', redirectTo: 'assessments', pathMatch: 'full' }\n" +
"];\n"
);

writeTsFile('features/analytics/analytics.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { AssessmentTrendPageComponent } from './pages/assessment-trend/assessment-trend-page.component';\n" +
"import { CompletionMetricsPageComponent } from './pages/completion-metrics/completion-metrics-page.component';\n" +
"import { CompetencyHeatmapPageComponent } from './pages/competency-heatmap/competency-heatmap-page.component';\n" +
"import { ScoreDistributionPageComponent } from './pages/score-distribution/score-distribution-page.component';\n" +
"\n" +
"export const ANALYTICS_ROUTES: Routes = [\n" +
"  { path: 'trends', component: AssessmentTrendPageComponent },\n" +
"  { path: 'completion', component: CompletionMetricsPageComponent },\n" +
"  { path: 'heatmaps', component: CompetencyHeatmapPageComponent },\n" +
"  { path: 'distribution', component: ScoreDistributionPageComponent },\n" +
"  { path: '', redirectTo: 'trends', pathMatch: 'full' }\n" +
"];\n"
);

console.log('Sprint 05 Phase 8 Reporting & Analytics UI generated successfully.');
