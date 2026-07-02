import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface CandidateReportRow {
  candidate_name: string;
  email: string;
  assessments_taken: number;
  average_score: number;
  passed_count: number;
}

@Component({
  selector: 'app-candidate-report-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Candidate Performance Report</h2>
          <p class="text-muted text-sm mt-1">Aggregated results and performance metrics per candidate.</p>
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
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Candidate Name</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Assessments Taken</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Passed</th>
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
                  No candidate data available.
                </td>
              </tr>
              <tr *ngFor="let row of data" class="hover:bg-brand/5 transition-colors group">
                <td class="p-4">
                  <span class="font-medium text-main">{{ row.candidate_name }}</span>
                </td>
                <td class="p-4">
                  <span class="text-muted text-sm">{{ row.email }}</span>
                </td>
                <td class="p-4 text-right text-muted">{{ row.assessments_taken }}</td>
                <td class="p-4 text-right">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand-light text-xs font-medium">
                    {{ row.passed_count }}
                  </span>
                </td>
                <td class="p-4 text-right font-medium text-main">
                  {{ row.average_score | number:'1.0-1' }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CandidateReportPageComponent implements OnInit {
  private http = inject(HttpClient);
  data: CandidateReportRow[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<{success: boolean, data: CandidateReportRow[]}>(`${environment.apiUrl}/results/reports/candidates/all`)
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
}