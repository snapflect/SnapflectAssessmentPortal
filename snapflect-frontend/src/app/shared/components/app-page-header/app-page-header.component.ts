import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-h1">{{ title() }}</h1>
        <p *ngIf="subtitle()" class="text-caption mt-1">{{ subtitle() }}</p>
      </div>
      <div class="flex items-center gap-3">
        <ng-content select="[action]"></ng-content>
      </div>
    </div>
  `
})
export class AppPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}