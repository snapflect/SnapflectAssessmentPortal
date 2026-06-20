import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, NotificationPanelComponent],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <button mat-icon-button (click)="toggleMenu.emit()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="brand">Snapflect</span>
      <span class="spacer"></span>
      <ng-content></ng-content>
      <app-notification-panel></app-notification-panel>
      <button mat-icon-button>
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .topbar { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .spacer { flex: 1 1 auto; }
    .menu-button { margin-right: 16px; }
    .brand { font-weight: 600; letter-spacing: 0.5px; }
  `]
})
export class TopbarComponent {
  toggleMenu = output<void>();
}