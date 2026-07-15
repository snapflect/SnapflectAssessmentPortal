import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AppPageHeaderComponent } from '../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../shared/components/app-data-table-shell/app-data-table-shell.component';

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
  imports: [CommonModule, AppPageHeaderComponent, DataTableShellComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Candidate Performance Report" subtitle="Aggregated results and performance metrics per candidate.">
        <button action class="btn-primary">
          Export CSV
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="data"
        emptyMessage="No candidate data available.">
        
        <ng-template #header>
          <tr>
            <th>Candidate Name</th>
            <th>Email</th>
            <th class="text-right">Assessments Taken</th>
            <th class="text-right">Passed</th>
            <th class="text-right">Avg Score</th>
          </tr>
        </ng-template>

        <ng-template #row let-row>
          <tr>
            <td class="font-medium text-main">{{ row.candidate_name }}</td>
            <td class="text-muted text-sm">{{ row.email }}</td>
            <td class="text-right text-muted">{{ row.assessments_taken }}</td>
            <td class="text-right">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand-light border border-brand/20 text-xs font-medium">
                {{ row.passed_count }}
              </span>
            </td>
            <td class="text-right font-medium text-main">
              {{ row.average_score | number:'1.0-1' }}%
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>
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