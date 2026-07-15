import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AppPageHeaderComponent } from '../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../shared/components/app-data-table-shell/app-data-table-shell.component';

interface CompetencyReportRow {
  competency_name: string;
  average_score: number;
  candidates_evaluated: number;
  proficient_count: number;
}

@Component({
  selector: 'app-competency-report-page',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, DataTableShellComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Competency Coverage Report" subtitle="Detailed analysis of candidate performance by competency area.">
        <button action class="btn-primary">
          Export CSV
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="data"
        emptyMessage="No competency data available.">
        
        <ng-template #header>
          <tr>
            <th>Competency Name</th>
            <th class="text-right">Candidates Evaluated</th>
            <th class="text-right">Proficient Count</th>
            <th class="text-right">Proficiency Rate</th>
            <th class="text-right">Avg Score</th>
          </tr>
        </ng-template>

        <ng-template #row let-row>
          <tr>
            <td class="font-medium text-main">{{ row.competency_name }}</td>
            <td class="text-right text-muted">{{ row.candidates_evaluated }}</td>
            <td class="text-right text-muted">{{ row.proficient_count }}</td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <span class="text-xs text-muted">{{ getProficiencyRate(row) | number:'1.0-1' }}%</span>
                <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-success rounded-full" [style.width.%]="getProficiencyRate(row)"></div>
                </div>
              </div>
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