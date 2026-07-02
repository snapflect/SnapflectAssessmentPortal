import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface CandidateResult {
  resultUuid: string;
  assessmentName: string;
  publishedAt: string;
  resultVersion: number;
  score: number | null;
  percentage: number | null;
  passFailStatus: string | null;
}

@Component({
  selector: 'app-candidate-results-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col relative overflow-y-auto custom-scrollbar">
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-main tracking-tight">My Transcript</h2>
        <p class="text-muted text-sm mt-1">Your official assessment history and scores.</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-muted font-medium animate-pulse">Loading your transcript...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && results.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600 bg-surface/30 rounded-3xl border border-border-light border-dashed">
        <div class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-main mb-2">No Results Yet</h3>
        <p class="text-sm text-muted text-center max-w-sm">You haven't completed any assessments that have been published yet.</p>
      </div>

      <!-- Results Grid -->
      <div *ngIf="!loading && results.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
        <div *ngFor="let result of results" class="glass-card overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">
          
          <!-- Top Accent Bar -->
          <div class="h-2 w-full" [ngClass]="getStatusBarClass(result.passFailStatus)"></div>

          <div class="p-6 flex-1 flex flex-col">
            <!-- Header -->
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1 pr-4">
                <h3 class="text-lg font-bold text-main leading-tight mb-2">{{ result.assessmentName || 'Unknown Assessment' }}</h3>
                <div class="flex items-center text-xs text-slate-500 gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>Completed: {{ result.publishedAt | date:'mediumDate' }}</span>
                </div>
              </div>
              
              <!-- Badge -->
              <div *ngIf="result.passFailStatus" class="flex-shrink-0">
                <span class="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border" [ngClass]="getBadgeClass(result.passFailStatus)">
                  {{ result.passFailStatus === 'PASS' ? 'Passed' : 'Failed' }}
                </span>
              </div>
              <div *ngIf="!result.passFailStatus" class="flex-shrink-0">
                <span class="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/20">
                  Completed
                </span>
              </div>
            </div>

            <!-- Score Circle -->
            <div class="flex justify-center items-center py-6 mb-4 relative">
              <div class="absolute inset-0 bg-surface/30 rounded-3xl -z-10"></div>
              
              <!-- Only show score if visibility allows -->
              <div *ngIf="result.percentage !== null" class="relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-8 shadow-inner"
                   [ngClass]="getCircleClass(result.passFailStatus)">
                <span class="text-3xl font-black text-main">{{ result.percentage }}<span class="text-xl text-slate-500">%</span></span>
                <span class="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Score</span>
              </div>
              
              <!-- Hidden Score State -->
              <div *ngIf="result.percentage === null" class="relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-4 border-dashed border-border-light text-slate-400">
                <svg class="w-8 h-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span class="text-[10px] text-center px-4 leading-tight">Score hidden by admin</span>
              </div>
            </div>

            <!-- View Details Button -->
            <div class="mt-auto">
              <button [routerLink]="['/results', result.resultUuid]" class="w-full py-3 rounded-xl font-bold text-slate-300 transition-all duration-300 bg-surface border border-border-light hover:bg-surface-light hover:border-brand/30 hover:text-brand-light flex items-center justify-center gap-2 group/btn">
                View Certificate & Details
                <svg class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidateResultsPageComponent implements OnInit {
  results: CandidateResult[] = [];
  loading = true;

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchResults();
  }

  fetchResults() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/candidates/results/history`)
      .subscribe({
        next: (res) => {
          this.results = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getStatusBarClass(status: string | null): string {
    if (status === 'PASS') return 'bg-emerald-500';
    if (status === 'FAIL') return 'bg-red-500';
    return 'bg-brand';
  }

  getBadgeClass(status: string | null): string {
    if (status === 'PASS') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'FAIL') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  getCircleClass(status: string | null): string {
    if (status === 'PASS') return 'border-emerald-500/20 shadow-emerald-500/10 text-emerald-500';
    if (status === 'FAIL') return 'border-red-500/20 shadow-red-500/10 text-red-500';
    return 'border-brand/20 shadow-brand/10 text-brand';
  }
}
