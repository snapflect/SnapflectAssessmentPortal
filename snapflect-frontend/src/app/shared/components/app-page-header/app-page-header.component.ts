import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <h1>{{ title() }}</h1>
    </header>
  `,
  styles: [`.page-header { /* Header styles */ }`]
})
export class AppPageHeaderComponent {
  title = input.required<string>();
}