import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="assets/logo.svg" alt="Logo" class="logo" *ngIf="false" />
      </div>
      <ng-content></ng-content>
    </aside>
  `,
  styles: [`
    .sidebar { width: 260px; height: 100%; background: #ffffff; border-right: 1px solid #e0e0e0; }
    .sidebar-header { padding: 16px; border-bottom: 1px solid #e0e0e0; }
  `]
})
export class SidebarComponent {}