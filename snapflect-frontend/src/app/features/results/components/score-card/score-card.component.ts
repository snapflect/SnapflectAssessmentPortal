import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-card">
      <h3 *ngIf="label">{{ label }}</h3>
      <div class="score-value" *ngIf="score !== undefined">{{ score }} / {{ total || 100 }}</div>
      <div class="chart-container" *ngIf="showChart">
        <div class="progress-bar" [style.width.%]="getPercentage()"></div>
      </div>
    </div>
  `
})
export class ScoreCardComponent {
  @Input() score?: number;
  @Input() total?: number = 100;
  @Input() label?: string;
  @Input() showChart: boolean = true;

  getPercentage(): number {
    if (this.score === undefined || this.total === undefined || this.total === 0) return 0;
    return (this.score / this.total) * 100;
  }
}