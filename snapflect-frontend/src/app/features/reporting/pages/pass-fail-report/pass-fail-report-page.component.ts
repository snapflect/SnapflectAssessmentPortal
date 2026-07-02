import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface PassFailReportRow {
  assessment_name: string;
  passed: number;
  failed: number;
  pass_percentage: number;
}

@Component({
  selector: 'app-pass-fail-report-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Pass/Fail Analysis</h2>
          <p class="text-muted text-sm mt-1">Breakdown of assessment pass rates and outcomes.</p>
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
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Passed</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Failed</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Pass Rate</th>
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
                  No pass/fail data available.
                </td>
              </tr>
              <tr *ngFor="let row of data" class="hover:bg-brand/5 transition-colors group">
                <td class="p-4">
                  <span class="font-medium text-main">{{ row.assessment_name }}</span>
                </td>
                <td class="p-4 text-right text-muted">{{ row.passed + row.failed }}</td>
                <td class="p-4 text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    {{ row.passed }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400">
                    {{ row.failed }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <span class="font-medium" [class]="getPassRateClass(row.pass_percentage)">
                      {{ row.pass_percentage | number:'1.0-1' }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PassFailReportPageComponent implements OnInit {
  private http = inject(HttpClient);
  data: PassFailReportRow[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<{success: boolean, data: PassFailReportRow[]}>(`${environment.apiUrl}/results/reports/pass-fail`)
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