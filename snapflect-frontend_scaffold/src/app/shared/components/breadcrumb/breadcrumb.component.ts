import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav class="breadcrumb">
      <ol>
        <li><a routerLink="/">Home</a></li>
        <li class="separator"><mat-icon>chevron_right</mat-icon></li>
        <li class="current">Current Page</li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb ol { list-style: none; display: flex; align-items: center; padding: 0; margin: 0 0 16px 0; font-size: 0.875rem; }
    .breadcrumb li { display: flex; align-items: center; }
    .breadcrumb a { color: #1976d2; text-decoration: none; }
    .breadcrumb .separator mat-icon { font-size: 1rem; width: 1rem; height: 1rem; margin: 0 4px; color: #9e9e9e; }
    .breadcrumb .current { color: #757575; font-weight: 500; }
  `]
})
export class BreadcrumbComponent {}