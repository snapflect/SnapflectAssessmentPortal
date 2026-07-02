import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  };
  relationships?: {
    candidate?: { attributes: { first_name: string; last_name: string } };
    assessment?: { attributes: { title: string } };
  };
}

@Component({
  selector: 'app-results-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto custom-scrollbar pb-6">
      <div class="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Analytics & Results</h2>
          <p class="text-muted text-sm mt-1">Platform-wide performance metrics and scoring overview.</p>
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

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">

        <!-- Pass / Fail Donut (SVG-based, no library needed) -->
        <div class="glass-card p-6 flex flex-col items-center">
          <h3 class="text-sm font-semibold text-muted mb-4 self-start">Pass vs Fail Distribution</h3>
          <div class="relative w-40 h-40">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" stroke-width="15"/>
              <!-- Pass arc -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="15"
                      [attr.stroke-dasharray]="getPassDash()"
                      stroke-dashoffset="0"
                      stroke-linecap="round"/>
              <!-- Fail arc -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" stroke-width="15"
                      [attr.stroke-dasharray]="getFailDash()"
                      [attr.stroke-dashoffset]="getFailOffset()"
                      stroke-linecap="round"/>
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

        <!-- Assessment Activity Bar Chart (CSS-based) -->
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
              <tr *ngIf="resultsLoading">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">Loading results...</td>
              </tr>
              <tr *ngIf="!resultsLoading && recentResults.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">No results yet.</td>
              </tr>
              <tr *ngFor="let r of recentResults" class="border-t border-white/5 hover:hover:brightness-110 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-main font-medium">
                    {{ r.relationships?.candidate?.attributes?.first_name }} {{ r.relationships?.candidate?.attributes?.last_name }}
                  </span>
                </td>
                <td class="px-6 py-4 text-muted truncate max-w-xs">
                  {{ r.relationships?.assessment?.attributes?.title || '—' }}
                </td>
                <td class="px-6 py-4 text-center font-mono">
                  <span [ngClass]="r.attributes.is_passed ? 'text-emerald-400' : 'text-red-400'">
                    {{ r.attributes.percentage_score }}%
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="r.attributes.is_passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                    {{ r.attributes.is_passed ? 'PASSED' : 'FAILED' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-slate-500 text-xs">
                  {{ r.attributes.scored_at | date:'dd MMM, HH:mm' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ResultsDashboardPageComponent implements OnInit {
  summary: AnalyticsSummary | null = null;
  recentResults: RecentResult[] = [];
  loading = true;
  resultsLoading = true;

  private http = inject(HttpClient);

  ngOnInit() { this.fetchAll(); }

  fetchAll() {
    this.fetchSummary();
    this.fetchRecentResults();
  }

  fetchSummary() {
    this.loading = true;
    console.log('Fetching analytics summary from API...');
    this.http.get<any>(`${environment.apiUrl}/analytics/dashboard/summary`)
      .subscribe({
        next: (res) => { 
          console.log('Analytics summary response:', res);
          this.summary = res.data || res; 
          this.loading = false; 
        },
        error: (err) => { 
          console.error('Analytics summary error:', err); 
          this.loading = false; 
        }
      });
  }

  fetchRecentResults() {
    this.resultsLoading = true;
    console.log('Fetching recent results from API...');
    this.http.get<any>(`${environment.apiUrl}/results/?include=candidate,assessment&per_page=20`)
      .subscribe({
        next: (res) => { 
          console.log('Recent results response:', res);
          this.recentResults = res.data || res; 
          this.resultsLoading = false; 
        },
        error: (err) => { 
          console.error('Recent results error:', err); 
          this.resultsLoading = false; 
        }
      });
  }

  // SVG donut helpers
  private circumference = 2 * Math.PI * 40; // 251.3

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