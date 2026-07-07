import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ChartData {
  categories: string[];
  series: { name: string, data: number[] }[];
}

interface AuthoringMetrics {
  total_questions: number;
  draft_questions: number;
  total_assessments: number;
  active_publications: number;
  charts?: {
    competencyCoverage: ChartData;
  }
}

@Component({
  selector: 'app-authoring-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col relative pb-10">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-main">Authoring Dashboard</h2>
        <p class="text-muted text-sm mt-1">Overview of content creation and publishing.</p>
      </div>

      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
      </div>

      <div *ngIf="!loading && metrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card p-6 flex flex-col justify-between">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Questions</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.total_questions }}</p>
        </div>
        <div class="glass-card p-6 flex flex-col justify-between border-b-4 border-amber-500">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Draft Questions</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.draft_questions }}</p>
        </div>
        <div class="glass-card p-6 flex flex-col justify-between">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Assessments</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.total_assessments }}</p>
        </div>
        <div class="glass-card p-6 flex flex-col justify-between border-b-4 border-emerald-500">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Publications</h3>
          <p class="text-4xl font-extrabold text-main">{{ metrics.active_publications }}</p>
        </div>
      </div>

      <!-- Competency Coverage — CSS radar-style horizontal bars -->
      <div *ngIf="!loading && metrics?.charts?.competencyCoverage" class="mt-8 glass-card p-6">
        <h3 class="text-lg font-bold text-main mb-6">Competency Coverage</h3>
        <div class="space-y-4">
          <ng-container *ngFor="let cat of metrics!.charts!.competencyCoverage.categories; let i = index">
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted w-36 shrink-0 truncate">{{ cat }}</span>
              <div class="flex-1 bg-surface-darker rounded-full h-3 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                     [style.width.%]="getBarHeight(metrics!.charts!.competencyCoverage.series[0].data[i], metrics!.charts!.competencyCoverage.series[0].data)">
                </div>
              </div>
              <span class="text-sm font-bold text-main w-8 text-right">{{ metrics!.charts!.competencyCoverage.series[0].data[i] }}</span>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class AuthoringDashboardPageComponent implements OnInit {
  metrics: AuthoringMetrics | null = null;
  loading = true;
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<{data: AuthoringMetrics}>(`${environment.apiUrl}/analytics/authoring/summary`).subscribe({
      next: (res) => {
        this.metrics = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getBarHeight(val: number, data: number[]): number {
    const max = Math.max(...data);
    return max === 0 ? 0 : Math.round((val / max) * 100);
  }
}
