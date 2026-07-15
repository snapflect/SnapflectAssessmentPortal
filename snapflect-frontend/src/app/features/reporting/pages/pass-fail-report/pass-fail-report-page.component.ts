import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AppPageHeaderComponent } from '../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../shared/components/app-data-table-shell/app-data-table-shell.component';

interface PassFailReportRow {
  assessment_name: string;
  passed: number;
  failed: number;
  pass_percentage: number;
}

@Component({
  selector: 'app-pass-fail-report-page',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, DataTableShellComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Header -->
      <app-page-header title="Pass/Fail Analysis" subtitle="Breakdown of assessment pass rates and outcomes.">
        <button action class="btn-primary">
          Export CSV
        </button>
      </app-page-header>

      <!-- Main Content -->
      <app-data-table-shell
        [loading]="loading"
        [items]="data"
        emptyMessage="No pass/fail data available.">
        
        <ng-template #header>
          <tr>
            <th>Assessment Name</th>
            <th class="text-right">Total Attempts</th>
            <th class="text-right">Passed</th>
            <th class="text-right">Failed</th>
            <th class="text-right">Pass Rate</th>
          </tr>
        </ng-template>

        <ng-template #row let-row>
          <tr>
            <td class="font-medium text-main">{{ row.assessment_name }}</td>
            <td class="text-right text-muted">{{ row.passed + row.failed }}</td>
            <td class="text-right">
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/10 text-success border border-success/20">
                {{ row.passed }}
              </span>
            </td>
            <td class="text-right">
              <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-danger/10 text-danger border border-danger/20">
                {{ row.failed }}
              </span>
            </td>
            <td class="text-right">
              <span class="font-medium" [class]="getPassRateClass(row.pass_percentage)">
                {{ row.pass_percentage | number:'1.0-1' }}%
              </span>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>
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
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-danger';
  }
}