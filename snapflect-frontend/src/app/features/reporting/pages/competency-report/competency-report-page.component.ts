import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface CompetencyReportRow {
  competency_name: string;
  average_score: number;
  candidates_evaluated: number;
  proficient_count: number;
}

@Component({
  selector: 'app-competency-report-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Competency Coverage Report</h2>
          <p class="text-muted text-sm mt-1">Detailed analysis of candidate performance by competency area.</p>
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
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Competency Name</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Candidates Evaluated</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Proficient Count</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Proficiency Rate</th>
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
                  No competency data available.
                </td>
              </tr>
              <tr *ngFor="let row of data" class="hover:bg-brand/5 transition-colors group">
                <td class="p-4">
                  <span class="font-medium text-main">{{ row.competency_name }}</span>
                </td>
                <td class="p-4 text-right text-muted">{{ row.candidates_evaluated }}</td>
                <td class="p-4 text-right text-muted">{{ row.proficient_count }}</td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <span class="text-xs text-muted">{{ getProficiencyRate(row) | number:'1.0-1' }}%</span>
                    <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="getProficiencyRate(row)"></div>
                    </div>
                  </div>
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
export class CompetencyReportPageComponent implements OnInit {
  private http = inject(HttpClient);
  data: CompetencyReportRow[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<{success: boolean, data: CompetencyReportRow[]}>(`${environment.apiUrl}/results/reports/competencies/all`)
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

  getProficiencyRate(row: CompetencyReportRow): number {
    if (!row.candidates_evaluated) return 0;
    return (row.proficient_count / row.candidates_evaluated) * 100;
  }
}