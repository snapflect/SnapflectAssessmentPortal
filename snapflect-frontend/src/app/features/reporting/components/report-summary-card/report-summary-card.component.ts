import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card p-6 flex flex-col items-center justify-center text-center">
      <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-2">{{ title }}</h3>
      <div class="text-3xl font-bold text-main">{{ value }}</div>
      <div *ngIf="trend !== undefined" class="mt-2 text-sm font-medium" [ngClass]="trend > 0 ? 'text-emerald-500' : (trend < 0 ? 'text-rose-500' : 'text-gray-500')">
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </div>
    </div>
  `
})
export class ReportSummaryCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() trend?: number;
}