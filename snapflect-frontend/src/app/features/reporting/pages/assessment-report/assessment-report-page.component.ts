import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface AssessmentReportRow {
  assessment_name: string;
  total_attempts: number;
  completed: number;
  pass_rate: number;
  average_score: number;
}

@Component({
  selector: 'app-assessment-report-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Assessment Report</h2>
          <p class="text-muted text-sm mt-1">Overview of assessment performance and completion metrics.</p>
        </div>
        <button class="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors">
          Export CSV
        </button>
      </div>

      <!-- Main Content -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1 p-0">
          <table class="w-full text-left border-collapse">
            <thead class="bg-brand/5 border-b border-border sticky top-0 z-10">
              <tr>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Assessment Name</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Total Attempts</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Completed</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Pass Rate</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/50">
              <tr *ngIf="loading">
                <td colspan="5" class="p-8 text-center text-muted">
                  Loading report data...
                </td>
              </tr>
              <tr *ngIf="!loading && data.length === 0">
                <td colspan="5" class="p-8 text-center text-muted">
                  No assessment data available.
                </td>
              </tr>
              <tr *ngFor="let row of data" class="hover:bg-brand/5 transition-colors group">
                <td class="p-4">
                  <span class="font-medium text-main">{{ row.assessment_name }}</span>
                </td>
                <td class="p-4 text-right text-muted">{{ row.total_attempts }}</td>
                <td class="p-4 text-right text-muted">{{ row.completed }}</td>
                <td class="p-4 text-right">
                  <span [class]="getPassRateClass(row.pass_rate)" class="font-medium">
                    {{ row.pass_rate }}%
                  </span>
                </td>
                <td class="p-4 text-right font-medium text-main">
                  {{ row.average_score }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AssessmentReportPageComponent implements OnInit {
  private http = inject(HttpClient);
  data: AssessmentReportRow[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<{success: boolean, data: AssessmentReportRow[]}>(`${environment.apiUrl}/results/reports/assessments/all`)
      .subscribe({
        next: (res) => {
          this.data = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getPassRateClass(rate: number): string {
    if (rate >= 80) return 'text-emerald-500';
    if (rate >= 60) return 'text-amber-500';
    return 'text-rose-500';
  }
}