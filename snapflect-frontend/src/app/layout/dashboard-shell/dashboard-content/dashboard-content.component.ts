import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="dashboard-content-card">
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .dashboard-content-card { margin-top: 16px; border-radius: 12px; }
  `]
})
export class DashboardContentComponent {}