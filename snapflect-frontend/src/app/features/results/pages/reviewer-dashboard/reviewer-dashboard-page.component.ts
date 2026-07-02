import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ReviewerMetrics {
  pending_reviews: number;
  completed_reviews: number;
}

@Component({
  selector: 'app-reviewer-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-main tracking-tight">Reviewer Dashboard</h2>
        <p class="text-muted text-sm mt-1">Overview of your manual scoring workload.</p>
      </div>

      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
      </div>

      <div *ngIf="!loading && metrics" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-card p-6 flex flex-col justify-between border-b-4 border-amber-500">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Manual Scoring</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.pending_reviews }}</p>
        </div>
        <div class="glass-card p-6 flex flex-col justify-between border-b-4 border-emerald-500">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Completed Reviews</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.completed_reviews }}</p>
        </div>
      </div>
      
      <div *ngIf="!loading" class="mt-8 glass-card p-8 flex flex-col items-center justify-center min-h-[300px]">
         <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-inner">
           <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         </div>
         <h3 class="text-lg font-bold text-main mb-1">Advanced Analytics coming soon</h3>
         <p class="text-sm text-muted">Reviewer productivity charts will appear here.</p>
      </div>
    </div>
  `
})
export class ReviewerDashboardPageComponent implements OnInit {
  metrics: ReviewerMetrics | null = null;
  loading = true;
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<{data: ReviewerMetrics}>(`${environment.apiUrl}/analytics/reviewer/summary`).subscribe({
      next: (res) => {
        this.metrics = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
