import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-count-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold rounded-md border border-brand/20 bg-brand/10 text-brand">
      {{ count() }} {{ label() }}
    </span>
  `
})
export class CountBadgeComponent {
  count = input.required<number>();
  label = input.required<string>();
}
