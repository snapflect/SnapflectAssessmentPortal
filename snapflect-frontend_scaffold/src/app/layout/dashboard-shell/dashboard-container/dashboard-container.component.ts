import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: `
    <div class="dashboard-container">
      <app-breadcrumb></app-breadcrumb>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 16px 0; }
  `]
})
export class DashboardContainerComponent {}