import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="getBadgeClass()">
      {{ getStatusLabel() }}
    </span>
  `
})
export class ResultStatusBadgeComponent {
  @Input() status: 'passed' | 'failed' | 'pending' | 'review_required' | 'unknown' = 'unknown';

  getBadgeClass(): string {
    switch (this.status) {
      case 'passed': return 'badge-success';
      case 'failed': return 'badge-danger';
      case 'pending': return 'badge-warning';
      case 'review_required': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(): string {
    switch (this.status) {
      case 'passed': return 'Passed';
      case 'failed': return 'Failed';
      case 'pending': return 'Pending';
      case 'review_required': return 'Needs Review';
      default: return 'Unknown';
    }
  }
}