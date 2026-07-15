import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="px-2.5 py-1 rounded text-xs font-semibold tracking-wide border inline-block" [ngClass]="colorClasses()">
      {{ label() }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<string>();

  label = computed(() => {
    return this.status().replace(/_/g, ' ').toUpperCase();
  });

  colorClasses = computed(() => {
    const s = this.status().toUpperCase();
    
    // SUCCESS
    if (['ACTIVE', 'PUBLISHED', 'COMPLETED', 'PASS'].includes(s)) {
      return 'bg-success/10 text-success border-success/20';
    }
    // DANGER
    if (['INACTIVE', 'ARCHIVED', 'EXPIRED', 'PAST_DUE', 'FAIL', 'TERMINATED', 'DELETED'].includes(s)) {
      return 'bg-danger/10 text-danger border-danger/20';
    }
    // WARNING
    if (['DRAFT', 'PENDING', 'TRIALING', 'PAUSED'].includes(s)) {
      return 'bg-warning/10 text-warning border-warning/20';
    }
    // INFO
    if (['IN_PROGRESS', 'SCHEDULED'].includes(s)) {
      return 'bg-info/10 text-info border-info/20';
    }
    
    // DEFAULT
    return 'bg-surface-darker text-muted border-border-light';
  });
}
