import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface AnalyticsSummary {
  total_assessments: number;
  total_attempts: number;
  total_passed: number;
  total_failed: number;
  average_score: number;
  pass_rate: number;
  active_sessions: number;
  pending_reviews: number;
}

interface RecentResult {
  uuid: string;
  attributes: {
    total_score: number;
    percentage_score: number;
    is_passed: boolean;
    status: string;
    scored_at: string;
    selection_status?: string;
    attempt_uuid?: string;
  };
  relationships?: {
    candidate?: { attributes: { first_name: string; last_name: string } };
    assessment?: { attributes: { title: string } };
  };
}

interface AssessmentSummary {
  assessment_id: number;
  assessment_uuid: string;
  assessment_name: string;
  total_candidates: number;
  selected_count: number;
  rejected_count: number;
  pending_count: number;
}

@Component({
  selector: 'app-results-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto custom-scrollbar pb-6">
      <div class="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Analytics & Results</h2>
          <p class="text-muted text-sm mt-1">Platform-wide performance metrics and candidate selection.</p>
        </div>
        <button (click)="fetchAll()" class="btn-secondary text-sm flex items-center gap-2" [disabled]="loading || resultsLoading">
          <svg *ngIf="!(loading || resultsLoading)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <svg *ngIf="loading || resultsLoading" class="animate-spin w-4 h-4 text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ (loading || resultsLoading) ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <!-- TABS -->
      <div class="flex gap-6 border-b border-border-light mb-6">
        <button (click)="activeTab = 'overview'" [class.border-brand]="activeTab === 'overview'" [class.text-brand-light]="activeTab === 'overview'" class="pb-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-main transition-colors">Overview</button>
        <button (click)="activeTab = 'selections'; fetchSelections()" [class.border-brand]="activeTab === 'selections'" [class.text-brand-light]="activeTab === 'selections'" class="pb-2 text-sm font-medium border-b-2 border-transparent text-muted hover:text-main transition-colors">Candidate Selections</button>
      </div>

      <!-- OVERVIEW TAB -->
      <div *ngIf="activeTab === 'overview'" class="flex flex-col gap-6">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
          <div class="glass-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all"></div>
            <div class="text-3xl font-bold text-emerald-400 mb-1">{{ summary?.pass_rate || 0 }}%</div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Pass Rate</div>
            <div class="text-xs text-slate-600 mt-2">{{ summary?.total_passed || 0 }} passed of {{ summary?.total_attempts || 0 }}</div>
          </div>

          <div class="glass-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-brand/10 group-hover:bg-brand/20 transition-all"></div>
            <div class="text-3xl font-bold text-brand-light mb-1">{{ summary?.average_score || 0 }}%</div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Avg. Score</div>
            <div class="text-xs text-slate-600 mt-2">Across all attempts</div>
          </div>

          <div class="glass-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all"></div>
            <div class="text-3xl font-bold text-amber-400 mb-1">{{ summary?.active_sessions || 0 }}</div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Live Sessions</div>
            <div class="text-xs text-slate-600 mt-2">Currently in progress</div>
          </div>

          <div class="glass-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-all"></div>
            <div class="text-3xl font-bold text-red-400 mb-1">{{ summary?.pending_reviews || 0 }}</div>
            <div class="text-xs text-slate-500 uppercase tracking-wider">Pending Review</div>
            <div class="text-xs text-slate-600 mt-2">Manual scoring needed</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <div class="glass-card p-6 flex flex-col items-center">
            <h3 class="text-sm font-semibold text-muted mb-4 self-start">Pass vs Fail Distribution</h3>
            <div class="relative w-40 h-40">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" stroke-width="15"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="15"
                        [attr.stroke-dasharray]="getPassDash()" stroke-dashoffset="0" stroke-linecap="round"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" stroke-width="15"
                        [attr.stroke-dasharray]="getFailDash()" [attr.stroke-dashoffset]="getFailOffset()" stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-main">{{ summary?.pass_rate || 0 }}%</span>
                <span class="text-xs text-slate-500">Pass Rate</span>
              </div>
            </div>
            <div class="flex gap-6 mt-4 text-xs">
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Passed ({{ summary?.total_passed || 0 }})</div>
              <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span> Failed ({{ summary?.total_failed || 0 }})</div>
            </div>
          </div>

          <div class="glass-card p-6 md:col-span-2">
            <h3 class="text-sm font-semibold text-muted mb-4">Assessment Volume Summary</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Total Assessments</span>
                  <span class="text-main font-bold">{{ summary?.total_assessments || 0 }}</span>
                </div>
                <div class="h-2 hover:brightness-110 rounded-full overflow-hidden">
                  <div class="h-full bg-brand/60 rounded-full" [style.width.%]="100"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Total Attempts</span>
                  <span class="text-main font-bold">{{ summary?.total_attempts || 0 }}</span>
                </div>
                <div class="h-2 hover:brightness-110 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500/60 rounded-full" [style.width.%]="getAttemptsPct()"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Passed Attempts</span>
                  <span class="text-emerald-400 font-bold">{{ summary?.total_passed || 0 }}</span>
                </div>
                <div class="h-2 hover:brightness-110 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500/60 rounded-full" [style.width.%]="getPassedPct()"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Failed Attempts</span>
                  <span class="text-red-400 font-bold">{{ summary?.total_failed || 0 }}</span>
                </div>
                <div class="h-2 hover:brightness-110 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500/60 rounded-full" [style.width.%]="getFailedPct()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Results Table -->
        <div class="glass-card overflow-hidden flex-shrink-0">
          <div class="px-6 py-4 border-b border-border-light bg-input-bg flex justify-between items-center">
            <h3 class="text-sm font-semibold text-muted">Recent Results</h3>
            <span class="text-xs text-slate-600">Latest {{ recentResults.length }} records</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-muted">
              <thead class="text-xs text-muted uppercase bg-black/40">
                <tr>
                  <th class="px-6 py-3 font-medium text-left">Candidate</th>
                  <th class="px-6 py-3 font-medium text-left">Assessment</th>
                  <th class="px-6 py-3 font-medium text-center">Score</th>
                  <th class="px-6 py-3 font-medium text-center">Result</th>
                  <th class="px-6 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="resultsLoading"><td colspan="5" class="px-6 py-8 text-center text-slate-500">Loading results...</td></tr>
                <tr *ngIf="!resultsLoading && recentResults.length === 0"><td colspan="5" class="px-6 py-8 text-center text-slate-500">No results yet.</td></tr>
                <tr *ngFor="let r of recentResults" class="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors" [routerLink]="['/results', r.uuid]">
                  <td class="px-6 py-4 text-main font-medium">{{ r.relationships?.candidate?.attributes?.first_name }} {{ r.relationships?.candidate?.attributes?.last_name }}</td>
                  <td class="px-6 py-4 text-muted truncate max-w-xs">{{ r.relationships?.assessment?.attributes?.title || '—' }}</td>
                  <td class="px-6 py-4 text-center font-mono">
                    <span [ngClass]="r.attributes.is_passed ? 'text-emerald-400' : 'text-red-400'">{{ r.attributes.percentage_score }}%</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-2.5 py-0.5 text-xs font-medium rounded-full" [ngClass]="r.attributes.is_passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ r.attributes.is_passed ? 'PASSED' : 'FAILED' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-slate-500 text-xs">{{ r.attributes.scored_at | date:'dd MMM, HH:mm' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SELECTIONS TAB -->
      <div *ngIf="activeTab === 'selections'" class="flex flex-col gap-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Assessment List -->
          <div class="glass-card flex flex-col overflow-hidden h-[600px]">
            <div class="px-6 py-4 border-b border-border-light bg-input-bg">
              <h3 class="text-sm font-semibold text-muted">Assessments</h3>
            </div>
            <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
              <div *ngIf="selectionsLoading" class="p-4 text-center text-slate-500 text-sm">Loading...</div>
              <div *ngIf="!selectionsLoading && assessmentsSummary.length === 0" class="p-4 text-center text-slate-500 text-sm">No assessments found.</div>
              <div *ngFor="let a of assessmentsSummary" 
                   (click)="viewCandidates(a.assessment_uuid)"
                   [class.bg-white_5]="selectedAssessmentUuid === a.assessment_uuid"
                   class="p-4 mb-2 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                <div class="font-medium text-main mb-2 group-hover:text-brand-light transition-colors">{{ a.assessment_name }}</div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="text-slate-400">{{ a.total_candidates }} Candidates</span>
                  <div class="flex gap-2">
                    <span class="text-emerald-400" title="Selected" *ngIf="a.selected_count > 0">{{ a.selected_count }} S</span>
                    <span class="text-red-400" title="Rejected" *ngIf="a.rejected_count > 0">{{ a.rejected_count }} R</span>
                    <span class="text-amber-400" title="Pending" *ngIf="a.pending_count > 0">{{ a.pending_count }} P</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Candidates List -->
          <div class="glass-card lg:col-span-2 overflow-hidden flex flex-col h-[600px]">
            <div class="px-6 py-4 border-b border-border-light bg-input-bg flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h3 class="text-sm font-semibold text-muted">Candidate Results</h3>
                <span *ngIf="selectedAssessmentUuid && !candidatesLoading" class="text-xs text-slate-600">{{ assessmentCandidates.length }} candidates</span>
              </div>
              <button *ngIf="selectedAssessmentUuid && hasSelectedCandidates()" 
                      (click)="exportToCsv()"
                      class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export Selected (CSV)
              </button>
            </div>
            <div class="overflow-y-auto custom-scrollbar flex-1 p-0">
              <div *ngIf="!selectedAssessmentUuid" class="flex items-center justify-center h-full text-slate-500 text-sm">
                Select an assessment from the left to view candidates.
              </div>
              <div *ngIf="selectedAssessmentUuid && candidatesLoading" class="flex items-center justify-center h-full text-slate-500 text-sm">
                Loading candidates...
              </div>
              
              <table *ngIf="selectedAssessmentUuid && !candidatesLoading && assessmentCandidates.length > 0" class="w-full text-sm text-muted">
                <thead class="text-xs text-muted uppercase bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th class="px-6 py-3 font-medium text-left">Candidate</th>
                    <th class="px-6 py-3 font-medium text-center">Score</th>
                    <th class="px-6 py-3 font-medium text-center">Result</th>
                    <th class="px-6 py-3 font-medium text-center">Status</th>
                    <th class="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of assessmentCandidates" class="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">
                      <div class="text-main font-medium">{{ c.relationships?.candidate?.attributes?.first_name }} {{ c.relationships?.candidate?.attributes?.last_name }}</div>
                      <div class="text-xs text-slate-500 mt-1">{{ c.attributes.scored_at | date:'dd MMM, HH:mm' }}</div>
                    </td>
                    <td class="px-6 py-4 text-center font-mono">
                      <span [ngClass]="c.attributes.is_passed ? 'text-emerald-400' : 'text-red-400'">{{ c.attributes.percentage_score }}%</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="px-2 py-0.5 text-xs font-medium rounded text-slate-300" [ngClass]="c.attributes.is_passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
                        {{ c.attributes.is_passed ? 'PASS' : 'FAIL' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span *ngIf="c.attributes.selection_status === 'PENDING'" class="text-amber-400 text-xs font-medium">PENDING</span>
                      <span *ngIf="c.attributes.selection_status === 'SELECTED'" class="text-emerald-400 text-xs font-medium">SELECTED</span>
                      <span *ngIf="c.attributes.selection_status === 'REJECTED'" class="text-red-400 text-xs font-medium">REJECTED</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2" *ngIf="c.attributes.attempt_uuid">
                        <button (click)="updateSelectionStatus(c.attributes.attempt_uuid, 'SELECTED')" 
                                [disabled]="c.attributes.selection_status === 'SELECTED'"
                                class="px-3 py-1 rounded text-xs font-medium transition-colors"
                                [ngClass]="c.attributes.selection_status === 'SELECTED' ? 'bg-emerald-500/20 text-emerald-500 opacity-50 cursor-not-allowed' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20'">
                          Select
                        </button>
                        <button (click)="updateSelectionStatus(c.attributes.attempt_uuid, 'REJECTED')" 
                                [disabled]="c.attributes.selection_status === 'REJECTED'"
                                class="px-3 py-1 rounded text-xs font-medium transition-colors"
                                [ngClass]="c.attributes.selection_status === 'REJECTED' ? 'bg-red-500/20 text-red-500 opacity-50 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20'">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="selectedAssessmentUuid && !candidatesLoading && assessmentCandidates.length === 0" class="flex items-center justify-center h-full text-slate-500 text-sm">
                No candidates found for this assessment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResultsDashboardPageComponent implements OnInit {
  activeTab: 'overview' | 'selections' = 'overview';
  summary: AnalyticsSummary | null = null;
  recentResults: RecentResult[] = [];
  loading = true;
  resultsLoading = true;

  assessmentsSummary: AssessmentSummary[] = [];
  selectionsLoading = false;
  selectedAssessmentUuid: string | null = null;
  assessmentCandidates: RecentResult[] = [];
  candidatesLoading = false;

  private http = inject(HttpClient);

  ngOnInit() { this.fetchAll(); }

  fetchAll() {
    if (this.activeTab === 'overview') {
      this.fetchSummary();
      this.fetchRecentResults();
    } else {
      this.fetchSelections();
      if (this.selectedAssessmentUuid) {
        this.viewCandidates(this.selectedAssessmentUuid);
      }
    }
  }

  fetchSummary() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/analytics/dashboard/summary`).subscribe({
      next: (res) => { this.summary = res.data || res; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  fetchRecentResults() {
    this.resultsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/results/?include=candidate,assessment,assessmentAttempt&per_page=20&latest_attempt_per_candidate=true`).subscribe({
      next: (res) => { this.recentResults = res.data || res; this.resultsLoading = false; },
      error: (err) => { console.error(err); this.resultsLoading = false; }
    });
  }

  fetchSelections() {
    this.selectionsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/results/assessments-summary`).subscribe({
      next: (res) => { this.assessmentsSummary = res.data; this.selectionsLoading = false; },
      error: (err) => { console.error(err); this.selectionsLoading = false; }
    });
  }

  viewCandidates(assessmentUuid: string) {
    this.selectedAssessmentUuid = assessmentUuid;
    this.candidatesLoading = true;
    this.http.get<any>(`${environment.apiUrl}/results/?assessment_uuid=${assessmentUuid}&latest_attempt_per_candidate=true&include=candidate,assessmentAttempt&per_page=100`).subscribe({
      next: (res) => { this.assessmentCandidates = res.data; this.candidatesLoading = false; },
      error: (err) => { console.error(err); this.candidatesLoading = false; }
    });
  }

  updateSelectionStatus(attemptUuid: string, status: string) {
    this.http.patch<any>(`${environment.apiUrl}/results/attempts/${attemptUuid}/selection`, { selection_status: status }).subscribe({
      next: (res) => {
        // Update local state
        const candidate = this.assessmentCandidates.find(c => c.attributes.attempt_uuid === attemptUuid);
        if (candidate) {
          candidate.attributes.selection_status = status;
        }
        this.fetchSelections(); // Refresh counts
      },
      error: (err) => { console.error(err); }
    });
  }

  hasSelectedCandidates(): boolean {
    return this.assessmentCandidates.some(c => c.attributes.selection_status === 'SELECTED');
  }

  exportToCsv() {
    if (!this.selectedAssessmentUuid) return;
    
    const token = localStorage.getItem('access_token');
    this.http.get(`${environment.apiUrl}/results/assessments/${this.selectedAssessmentUuid}/selected-candidates/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'selected_candidates.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => { console.error('Failed to export CSV', err); }
    });
  }

  private circumference = 2 * Math.PI * 40;

  getPassDash(): string {
    const passRate = this.summary?.pass_rate || 0;
    const dash = (passRate / 100) * this.circumference;
    return `${dash} ${this.circumference - dash}`;
  }

  getFailDash(): string {
    const failRate = 100 - (this.summary?.pass_rate || 0);
    const dash = (failRate / 100) * this.circumference;
    return `${dash} ${this.circumference - dash}`;
  }

  getFailOffset(): number {
    const passRate = this.summary?.pass_rate || 0;
    return -((passRate / 100) * this.circumference);
  }

  getAttemptsPct(): number {
    if (!this.summary || !this.summary.total_assessments) return 0;
    return Math.min(100, (this.summary.total_attempts / Math.max(this.summary.total_assessments * 5, 1)) * 100);
  }

  getPassedPct(): number {
    if (!this.summary || !this.summary.total_attempts) return 0;
    return (this.summary.total_passed / this.summary.total_attempts) * 100;
  }

  getFailedPct(): number {
    if (!this.summary || !this.summary.total_attempts) return 0;
    return (this.summary.total_failed / this.summary.total_attempts) * 100;
  }
}