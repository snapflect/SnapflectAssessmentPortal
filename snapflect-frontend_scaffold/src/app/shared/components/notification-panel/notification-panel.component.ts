import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notificationsMenu">
      <mat-icon [matBadge]="unreadCount()" matBadgeColor="warn" [matBadgeHidden]="unreadCount() === 0">notifications</mat-icon>
    </button>
    <mat-menu #notificationsMenu="matMenu">
      <button mat-menu-item>
        <mat-icon>info</mat-icon>
        <span>No new notifications</span>
      </button>
    </mat-menu>
  `
})
export class NotificationPanelComponent {
  unreadCount = signal(3);
}