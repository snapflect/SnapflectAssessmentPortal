import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface ResultVersion {
  id: number;
  result_id: number;
  version_number: number;
  overall_score: number;
  percentage_score: number;
  pass_fail_status: string;
  created_date: string;
  change_reason?: string;
  calculated_by?: number;
}

@Component({
  selector: 'app-result-version-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-start mb-6 shrink-0">
        <div>
          <a [routerLink]="['/results', uuid]" class="text-brand-light text-sm hover:underline mb-2 inline-block">← Back to Result Details</a>
          <h2 class="text-2xl font-bold text-main flex items-center gap-3">
            Result Version History
          </h2>
          <p class="text-muted text-sm mt-1">Audit log of score recalculations and version updates.</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1 p-0">
          <table class="w-full text-left border-collapse">
            <thead class="bg-brand/5 border-b border-border sticky top-0 z-10">
              <tr>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Version</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Score</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th class="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/50">
              <tr *ngIf="loading">
                <td colspan="5" class="p-8 text-center text-muted">
                  Loading version history...
                </td>
              </tr>
              <tr *ngIf="!loading && versions.length === 0">
                <td colspan="5" class="p-8 text-center text-muted">
                  No version history found.
                </td>
              </tr>
              <tr *ngFor="let version of versions; let i = index" class="hover:bg-brand/5 transition-colors group">
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-slate-300 font-medium text-xs">
                      v{{ version.version_number }}
                    </span>
                    <span *ngIf="i === 0" class="text-[10px] uppercase font-bold text-brand border border-brand/30 px-1.5 py-0.5 rounded bg-brand/10">Current</span>
                  </div>
                </td>
                <td class="p-4">
                  <span class="text-muted">{{ version.created_date | date:'medium' }}</span>
                </td>
                <td class="p-4 text-right font-medium text-main">
                  {{ version.percentage_score | number:'1.0-1' }}%
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                        [ngClass]="version.pass_fail_status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                    {{ version.pass_fail_status }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="text-muted text-sm">{{ version.change_reason || 'Initial calculation' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ResultVersionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  uuid: string | null = null;
  versions: ResultVersion[] = [];
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.uuid = params.get('uuid');
      if (this.uuid) {
        this.fetchVersions(this.uuid);
      } else {
        this.loading = false;
      }
    });
  }

  fetchVersions(uuid: string) {
    this.http.get<{success: boolean, data: ResultVersion[]}>(`${environment.apiUrl}/results/${uuid}/versions`)
      .subscribe({
        next: (res) => {
          // Sort versions descending by version_number just in case
          this.versions = (res.data || []).sort((a, b) => b.version_number - a.version_number);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching result versions', err);
          this.loading = false;
        }
      });
  }
}