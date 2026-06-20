import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      <div class="nav-section">PLATFORM ADMIN</div>
      <a mat-list-item routerLink="/admin/organizations"><mat-icon matListItemIcon>business</mat-icon><div matListItemTitle>Organizations</div></a>
      <a mat-list-item routerLink="/admin/users"><mat-icon matListItemIcon>people</mat-icon><div matListItemTitle>Users</div></a>
      
      <div class="nav-section">ORGANIZATION ADMIN</div>
      <a mat-list-item routerLink="/admin/assessments"><mat-icon matListItemIcon>assignment</mat-icon><div matListItemTitle>Assessments</div></a>
      <a mat-list-item routerLink="/admin/results"><mat-icon matListItemIcon>bar_chart</mat-icon><div matListItemTitle>Results</div></a>
      
      <div class="nav-section">EVALUATOR</div>
      <a mat-list-item routerLink="/admin/reviews"><mat-icon matListItemIcon>rate_review</mat-icon><div matListItemTitle>Manual Reviews</div></a>
    </mat-nav-list>
  `,
  styles: [`
    .nav-section { padding: 16px 16px 8px; font-size: 0.75rem; font-weight: 600; color: #9e9e9e; letter-spacing: 1px; }
  `]
})
export class AdminNavigationComponent {}