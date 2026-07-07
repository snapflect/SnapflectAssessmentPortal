import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UserStore } from '../../../../shared/stores/user.store';
import { ToastService } from '../../../../core/services/toast.service';
import { SlideOverComponent } from '../../../../shared/components/slide-over/slide-over.component';
import { RouterModule } from '@angular/router';
import ApexCharts from 'apexcharts';

interface ReviewerMetrics {
  pending_reviews: number;
  completed_reviews: number;
  average_score_awarded?: number;
  turnaround_time?: string;
  priority_queue?: { uuid: string; candidate_name: string; assessment_name: string; date_submitted: string; status: string }[];
}

interface ClientReviewer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  pending_reviews: number;
  completed_reviews: number;
  total_assigned: number;
}

interface PendingReview {
  uuid: string;
  assessment_name: string;
  candidate_name: string;
  question_text: string;
  status: string;
  created_date: string;
}

@Component({
  selector: 'app-reviewer-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SlideOverComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-main">
          {{ isClientAdmin ? 'Client Reviewer Metrics' : 'Dashboard' }}
        </h2>
        <p class="text-muted text-sm mt-1">
          {{ isClientAdmin ? 'Overview of your team\\'s manual scoring workload.' : 'Overview of your manual scoring workload.' }}
        </p>
      </div>

      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
      </div>

      <!-- PERSONAL METRICS (Reviewer view) -->
      <div *ngIf="!loading && !isClientAdmin && metrics" class="flex flex-col gap-8">
        <!-- Welcome Banner -->
        <div class="glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-brand/5 pointer-events-none"></div>
          <div class="z-10">
            <h3 class="text-2xl font-bold text-main">Welcome back, {{ userStore.profile()?.first_name || 'Reviewer' }}! 👋</h3>
            <p class="text-muted text-sm mt-1">You have <span class="font-semibold text-amber-500">{{ metrics.pending_reviews }} pending manual reviews</span> in your queue.</p>
          </div>
          <a routerLink="/scoring/manual"
             class="z-10 flex-shrink-0 ml-6 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Start Reviewing
          </a>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-amber-500/20">
            <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
              <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-muted text-sm font-medium z-10">Pending Reviews</p>
            <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics.pending_reviews }}</h3>
            <a routerLink="/scoring/manual" class="mt-3 text-xs text-amber-400 hover:underline z-10">View queue →</a>
          </div>
          <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
            <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
              <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p class="text-muted text-sm font-medium z-10">Completed Reviews</p>
            <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics.completed_reviews }}</h3>
            <span class="mt-3 text-xs text-muted z-10">All time</span>
          </div>
          <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
            <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
              <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <p class="text-muted text-sm font-medium z-10">Avg Score Awarded</p>
            <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics.average_score_awarded || 0 }}%</h3>
            <span class="mt-3 text-xs text-muted z-10">Scoring consistency</span>
          </div>
          <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
            <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
              <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-muted text-sm font-medium z-10">Avg Turnaround</p>
            <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics.turnaround_time || 'N/A' }}</h3>
            <span class="mt-3 text-xs text-muted z-10">Based on last 7 days</span>
          </div>
        </div>

        <!-- Next Up Queue -->
        <div class="glass-card p-0 flex flex-col overflow-hidden">
          <div class="p-6 border-b border-surface-darker flex items-center justify-between">
            <h3 class="text-lg font-bold text-main">Next Up</h3>
            <a routerLink="/scoring/manual" class="text-xs text-brand-light hover:underline">View all</a>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div *ngIf="metrics.priority_queue && metrics.priority_queue.length > 0" class="space-y-2">
              <div *ngFor="let item of metrics.priority_queue" class="p-4 rounded-lg bg-surface/50 border border-surface-darker hover:bg-surface transition-colors group relative">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="text-sm font-bold text-main">{{ item.candidate_name }}</p>
                    <p class="text-xs text-muted truncate max-w-[180px]">{{ item.assessment_name }}</p>
                  </div>
                  <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                    {{ item.status }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-surface-darker/50">
                  <p class="text-xs text-slate-500 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {{ item.date_submitted }}
                  </p>
                  <a routerLink="/scoring/manual" [queryParams]="{ highlight: item.uuid }" class="text-xs font-semibold text-brand-light hover:text-brand transition-colors flex items-center gap-1">
                    Grade <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </a>
                </div>
              </div>
            </div>
            <div *ngIf="!metrics.priority_queue || metrics.priority_queue.length === 0" class="text-center py-10 px-4">
              <div class="w-12 h-12 rounded-full bg-surface-darker/50 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p class="text-sm font-medium text-main">You're all caught up!</p>
              <p class="text-xs text-muted mt-1">No pending reviews at the moment.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CLIENT METRICS (Client Admin view) -->
      <div *ngIf="!loading && isClientAdmin && clientMetrics">
        <div class="glass-card overflow-hidden">
          <table class="min-w-full text-left text-sm whitespace-nowrap">
            <thead class="uppercase tracking-wider border-b-2 border-surface-darker text-muted bg-surface/50">
              <tr>
                <th scope="col" class="px-6 py-4">Reviewer</th>
                <th scope="col" class="px-6 py-4 text-center">Pending</th>
                <th scope="col" class="px-6 py-4 text-center">Completed</th>
                <th scope="col" class="px-6 py-4 text-center">Total Assigned</th>
                <th scope="col" class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rev of clientMetrics" class="border-b border-surface-darker hover:bg-surface/50 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-bold text-main">{{ rev.name }}</p>
                  <p class="text-xs text-muted">{{ rev.email }}</p>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">
                    {{ rev.pending_reviews }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                    {{ rev.completed_reviews }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-bold text-main">{{ rev.total_assigned }}</td>
                <td class="px-6 py-4 text-right space-x-2">
                   <button class="px-3 py-1.5 text-xs font-semibold rounded bg-surface hover:bg-surface-darker text-main transition-colors shadow-sm" (click)="reassign(rev)">Reassign</button>
                   <button class="px-3 py-1.5 text-xs font-semibold rounded bg-brand/10 hover:bg-brand/20 text-brand transition-colors shadow-sm" (click)="remind(rev)">Remind</button>
                </td>
              </tr>
              <tr *ngIf="clientMetrics.length === 0">
                 <td colspan="5" class="px-6 py-8 text-center text-muted">No reviewers found in your organization.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div *ngIf="!loading && isClientAdmin && clientMetrics && clientMetrics.length > 0" class="mt-8 glass-card p-6">
        <h3 class="text-lg font-bold text-main mb-6 border-b border-surface-darker pb-4">Reviewer Productivity</h3>
        <div id="reviewer-productivity-chart" class="w-full min-h-[350px]"></div>
      </div>

      <!-- Advanced Analytics Placeholder for Client Admin -->
      <div *ngIf="!loading && (isClientAdmin && (!clientMetrics || clientMetrics.length === 0))" class="mt-8 glass-card p-8 flex flex-col items-center justify-center min-h-[300px]">
         <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-inner">
           <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         </div>
         <h3 class="text-lg font-bold text-main mb-1">No reviewer data available</h3>
         <p class="text-sm text-muted">Reviewer productivity charts will appear here.</p>
      </div>

      <!-- Reassign Slide-Over -->
      <app-slide-over [isOpen]="showReassignModal" title="Reassign Reviews" subtitle="Transfer pending reviews from {{ selectedSourceReviewer?.name }}" (closeEvent)="closeReassignModal()">
        
        <div class="flex flex-col h-full">
          <div class="flex-1 overflow-y-auto custom-scrollbar pb-6">
            <div *ngIf="loadingReviews" class="flex justify-center py-12">
              <div class="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
            </div>

            <div *ngIf="!loadingReviews && pendingReviews.length === 0" class="text-center p-8 text-muted bg-surface-darker/30 rounded-lg">
              This reviewer has no pending reviews available to reassign.
            </div>

            <div *ngIf="!loadingReviews && pendingReviews.length > 0" class="space-y-6">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="selectAll" class="rounded border-slate-600 text-brand bg-slate-800"
                  [checked]="selectedReviewUuids.length === pendingReviews.length"
                  (change)="toggleAllReviews($event)">
                <label for="selectAll" class="text-sm font-medium text-main cursor-pointer">Select All ({{ pendingReviews.length }})</label>
              </div>

              <div class="border border-surface-darker rounded-lg overflow-hidden">
                <table class="min-w-full text-left text-sm whitespace-nowrap">
                  <thead class="bg-surface/50 border-b border-surface-darker text-muted uppercase tracking-wider">
                    <tr>
                      <th class="px-4 py-3 w-10"></th>
                      <th class="px-4 py-3">Assessment</th>
                      <th class="px-4 py-3">Candidate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rev of pendingReviews" class="border-b border-surface-darker hover:bg-surface/30">
                      <td class="px-4 py-3">
                        <input type="checkbox" class="rounded border-slate-600 text-brand bg-slate-800"
                          [checked]="selectedReviewUuids.includes(rev.uuid)"
                          (change)="toggleReviewSelection(rev.uuid)">
                      </td>
                      <td class="px-4 py-3 font-medium text-main">{{ rev.assessment_name }}</td>
                      <td class="px-4 py-3 text-muted">{{ rev.candidate_name }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-300 mb-2">Reassign selected reviews to:</label>
                <select [(ngModel)]="selectedTargetReviewerUuid" class="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-brand focus:border-brand p-2.5">
                  <option value="">-- Select a Target Reviewer --</option>
                  <ng-container *ngFor="let target of clientMetrics">
                    <option *ngIf="target.uuid !== selectedSourceReviewer?.uuid" [value]="target.uuid">
                      {{ target.name }} ({{ target.pending_reviews }} pending)
                    </option>
                  </ng-container>
                </select>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-border-light flex justify-end gap-3 pb-6">
            <button (click)="closeReassignModal()" class="btn-secondary px-4 py-2">
              Cancel
            </button>
            <button (click)="submitReassignment()" 
                    [disabled]="selectedReviewUuids.length === 0 || !selectedTargetReviewerUuid || submittingReassign"
                    class="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="submittingReassign" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Confirm
            </button>
          </div>
        </div>
      </app-slide-over>
    </div>
  `
})
export class ReviewerDashboardPageComponent implements OnInit {
  metrics: ReviewerMetrics | null = null;
  clientMetrics: ClientReviewer[] | null = null;
  loading = true;
  isClientAdmin = false;

  // Reassign Modal State
  showReassignModal = false;
  selectedSourceReviewer: ClientReviewer | null = null;
  pendingReviews: PendingReview[] = [];
  selectedReviewUuids: string[] = [];
  selectedTargetReviewerUuid = '';
  loadingReviews = false;
  submittingReassign = false;
  chartInstance: any;

  userStore = inject(UserStore);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.isClientAdmin = this.userStore.hasAnyRole(['CLIENT_ADMIN']);

    if (this.isClientAdmin) {
      this.http.get<{data: ClientReviewer[]}>(`${environment.apiUrl}/analytics/client/reviewers/summary`).subscribe({
        next: (res) => {
          this.clientMetrics = res.data;
          this.initChart();
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.http.get<{data: ReviewerMetrics}>(`${environment.apiUrl}/analytics/reviewer/summary`).subscribe({
        next: (res) => {
          this.metrics = res.data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  initChart() {
    if (!this.clientMetrics) return;

    const categories = this.clientMetrics.map(r => r.name);
    const pendingData = this.clientMetrics.map(r => r.pending_reviews);
    const completedData = this.clientMetrics.map(r => r.completed_reviews);

    const options: any = {
      series: [
        { name: 'Pending', data: pendingData },
        { name: 'Completed', data: completedData }
      ],
      chart: {
        type: 'bar',
        height: 350,
        background: 'transparent',
        toolbar: { show: false },
        fontFamily: 'inherit'
      },
      colors: ['#f59e0b', '#10b981'], // amber-500, emerald-500
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4
        },
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: categories,
        labels: {
          style: { colors: '#94a3b8' } // text-slate-400
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8' }
        }
      },
      legend: {
        position: 'top',
        labels: { colors: '#cbd5e1' } // text-slate-300
      },
      tooltip: {
        theme: 'dark'
      }
    };

    setTimeout(() => {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      const chartEl = document.querySelector('#reviewer-productivity-chart') as HTMLElement;
      if (chartEl) {
        this.chartInstance = new ApexCharts(chartEl, options);
        this.chartInstance.render();
      }
    }, 0);
  }

  reassign(rev: ClientReviewer) {
    this.selectedSourceReviewer = rev;
    this.showReassignModal = true;
    this.loadingReviews = true;
    this.pendingReviews = [];
    this.selectedReviewUuids = [];
    this.selectedTargetReviewerUuid = '';

    this.http.get<{data: PendingReview[]}>(`${environment.apiUrl}/analytics/client/reviewers/${rev.uuid}/pending`).subscribe({
      next: (res) => {
        this.pendingReviews = res.data;
        this.loadingReviews = false;
      },
      error: () => this.loadingReviews = false
    });
  }

  closeReassignModal() {
    this.showReassignModal = false;
    this.selectedSourceReviewer = null;
  }

  toggleAllReviews(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedReviewUuids = this.pendingReviews.map(r => r.uuid);
    } else {
      this.selectedReviewUuids = [];
    }
  }

  toggleReviewSelection(uuid: string) {
    const idx = this.selectedReviewUuids.indexOf(uuid);
    if (idx > -1) {
      this.selectedReviewUuids.splice(idx, 1);
    } else {
      this.selectedReviewUuids.push(uuid);
    }
  }

  submitReassignment() {
    if (!this.selectedSourceReviewer || !this.selectedTargetReviewerUuid || this.selectedReviewUuids.length === 0) return;

    this.submittingReassign = true;
    const payload = {
      target_reviewer_uuid: this.selectedTargetReviewerUuid,
      review_uuids: this.selectedReviewUuids
    };

    this.http.post(`${environment.apiUrl}/analytics/client/reviewers/${this.selectedSourceReviewer.uuid}/reassign`, payload).subscribe({
      next: () => {
        this.submittingReassign = false;
        this.closeReassignModal();
        this.toastService.success('Reviews Reassigned', 'The selected reviews have been successfully reassigned.');
        // Refresh dashboard
        this.loading = true;
        this.ngOnInit();
      },
      error: () => {
        this.submittingReassign = false;
        this.toastService.error('Reassignment Failed', 'Failed to reassign reviews. Please try again.');
      }
    });
  }

  remind(rev: ClientReviewer) {
    this.http.post(`${environment.apiUrl}/analytics/client/reviewers/${rev.uuid}/remind`, {}).subscribe({
      next: () => this.toastService.success('Reminder Sent', `Reminder sent successfully to ${rev.name}.`),
      error: () => this.toastService.error('Reminder Failed', `Failed to send reminder to ${rev.name}.`)
    });
  }
}
