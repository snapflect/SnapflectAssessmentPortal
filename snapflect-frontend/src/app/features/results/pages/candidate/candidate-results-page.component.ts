import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface CandidateResult {
  resultUuid: string;
  assessmentName: string;
  calculatedAt: string;
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
    <div class="dark-theme h-full flex flex-col bg-page text-main relative overflow-y-auto custom-scrollbar p-6">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-main">Completed Assessments</h2>
        <p class="text-muted text-sm mt-1">Review your official assessment history, scores, and certificates.</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-muted font-medium animate-pulse">Loading your history...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && results.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600 bg-surface/30 rounded-3xl border border-border-light border-dashed p-12">
        <div class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner relative">
           <div class="absolute inset-0 bg-brand/10 rounded-full animate-ping opacity-20"></div>
          <svg class="w-12 h-12 text-brand-light/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-main mb-2">No Results Yet</h3>
        <p class="text-sm text-muted text-center max-w-md">You haven't completed any assessments yet. Once you complete an assessment, your scores and certificates will appear here.</p>
        <button routerLink="/delivery/dashboard" class="mt-8 px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-brand to-brand-light hover:shadow-lg hover:shadow-brand/25 flex items-center gap-2">
          Find an Assessment
        </button>
      </div>

      <!-- Results Grid -->
      <div *ngIf="!loading && results.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
        <div *ngFor="let result of results" class="glass-card overflow-hidden group flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-brand/10 hover:-translate-y-1 bg-surface-light border border-border-light/50 relative">
          
          <!-- Top Accent Bar -->
          <div class="absolute top-0 left-0 right-0 h-1" [ngClass]="getStatusBarClass(result.passFailStatus)"></div>

          <div class="p-6 flex-1 flex flex-col">
            <!-- Header -->
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1 pr-4">
                <h3 class="text-lg font-bold text-main leading-tight mb-2 line-clamp-2">{{ result.assessmentName || 'Unknown Assessment' }}</h3>
                <div class="flex items-center text-xs text-slate-500 gap-1.5 font-medium">
                  <svg class="w-4 h-4 text-brand/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{ result.calculatedAt | date:'mediumDate' }}</span>
                </div>
              </div>
              
              <!-- Badge -->
              <div class="flex-shrink-0">
                <span *ngIf="result.passFailStatus" class="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm" [ngClass]="getBadgeClass(result.passFailStatus)">
                  {{ result.passFailStatus === 'PASS' ? 'Passed' : 'Failed' }}
                </span>
                <span *ngIf="!result.passFailStatus" class="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border bg-surface-light text-muted border-border">
                  Completed
                </span>
              </div>
            </div>

            <!-- Score Visual -->
            <div class="flex justify-center items-center py-4 mb-4 relative">
              <div class="absolute inset-0 bg-gradient-to-b from-surface/0 to-surface/40 rounded-3xl -z-10"></div>
              
              <!-- Only show score if visibility allows -->
              <div *ngIf="result.percentage !== null" class="relative w-28 h-28 flex flex-col items-center justify-center rounded-full border-4 shadow-inner bg-surface"
                   [ngClass]="getCircleClass(result.passFailStatus)">
                <span class="text-3xl font-black text-main font-display tracking-tighter">{{ result.percentage }}<span class="text-lg text-slate-500 font-medium ml-0.5">%</span></span>
                <span class="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Score</span>
              </div>
              
              <!-- Hidden Score State -->
              <div *ngIf="result.percentage === null" class="relative w-28 h-28 flex flex-col items-center justify-center rounded-full border-2 border-dashed border-border-light text-slate-400 bg-surface/50">
                <svg class="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
                <span class="text-[9px] text-center px-4 leading-tight font-medium">Hidden</span>
              </div>
            </div>

            <!-- View Details Button -->
            <div class="mt-auto pt-4 border-t border-border-light/40">
              <button [routerLink]="['/results', result.resultUuid]" class="w-full py-2.5 rounded-xl font-bold text-sm text-slate-300 transition-all duration-300 bg-surface border border-border-light hover:bg-white/5 hover:border-brand/40 hover:text-white flex items-center justify-center gap-2 group/btn relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  View Detailed Breakdown
                  <svg class="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:text-brand-light transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
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
    if (status === 'PASS') return 'bg-success';
    if (status === 'FAIL') return 'bg-danger';
    return 'bg-brand';
  }

  getBadgeClass(status: string | null): string {
    if (status === 'PASS') return 'bg-success/10 text-success border-success/20';
    if (status === 'FAIL') return 'bg-danger/10 text-danger border-danger/20';
    return 'bg-surface-light text-muted border-border';
  }

  getCircleClass(status: string | null): string {
    if (status === 'PASS') return 'border-success/20 shadow-success/10 text-success';
    if (status === 'FAIL') return 'border-danger/20 shadow-danger/10 text-danger';
    return 'border-brand/20 shadow-brand/10 text-brand';
  }
}
