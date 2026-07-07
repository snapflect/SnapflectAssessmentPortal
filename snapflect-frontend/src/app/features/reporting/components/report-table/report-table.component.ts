import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnDef {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'percentage';
}

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-brand/5 border-b border-border">
          <tr>
            <th *ngFor="let col of columns" class="p-4 text-xs font-semibold text-muted uppercase tracking-wider" [ngClass]="{'text-right': col.type === 'number' || col.type === 'percentage'}">
              {{ col.header }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/50">
          <tr *ngIf="loading">
            <td [attr.colspan]="columns.length" class="p-8 text-center text-muted">
              Loading report data...
            </td>
          </tr>
          <tr *ngIf="!loading && data.length === 0">
            <td [attr.colspan]="columns.length" class="p-8 text-center text-muted">
              No data available.
            </td>
          </tr>
          <tr *ngFor="let row of data" class="hover:bg-brand/5 transition-colors">
            <td *ngFor="let col of columns" class="p-4" [ngClass]="{'text-right': col.type === 'number' || col.type === 'percentage'}">
              <ng-container *ngIf="col.type === 'percentage'; else defaultCell">
                {{ row[col.key] }}%
              </ng-container>
              <ng-template #defaultCell>
                {{ row[col.key] }}
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ReportTableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
}