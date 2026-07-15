import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AppPageHeaderComponent } from '../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../shared/components/app-data-table-shell/app-data-table-shell.component';

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
  imports: [CommonModule, AppPageHeaderComponent, DataTableShellComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Assessment Report" subtitle="Overview of assessment performance and completion metrics.">
        <button action class="btn-primary">
          Export CSV
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="data"
        emptyMessage="No assessment data available.">
        
        <ng-template #header>
          <tr>
            <th>Assessment Name</th>
            <th class="text-right">Total Attempts</th>
            <th class="text-right">Completed</th>
            <th class="text-right">Pass Rate</th>
            <th class="text-right">Avg Score</th>
          </tr>
        </ng-template>

        <ng-template #row let-row>
          <tr>
            <td class="font-medium text-main">{{ row.assessment_name }}</td>
            <td class="text-right text-muted">{{ row.total_attempts }}</td>
            <td class="text-right text-muted">{{ row.completed }}</td>
            <td class="text-right">
              <span [class]="getPassRateClass(row.pass_rate)" class="font-medium">
                {{ row.pass_rate }}%
              </span>
            </td>
            <td class="text-right font-medium text-main">
              {{ row.average_score }}%
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>
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
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-danger';
  }
}