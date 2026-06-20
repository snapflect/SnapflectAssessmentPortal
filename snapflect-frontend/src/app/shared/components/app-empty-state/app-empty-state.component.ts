import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <p>{{ message() }}</p>
    </div>
  `,
  styles: [`.empty-state { /* Empty state styles */ }`]
})
export class AppEmptyStateComponent {
  message = input<string>('No data available.');
}