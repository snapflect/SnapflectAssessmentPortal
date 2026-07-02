import { Component, HostListener, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <button (click)="toggleDropdown()" class="relative text-muted hover:text-main transition-colors p-2 rounded-full hover:bg-white/5">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        
        <!-- Unread Badge -->
        <span *ngIf="notificationService.unreadCount() > 0" class="absolute top-1 right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>

      <!-- Dropdown Panel -->
      <div *ngIf="isOpen" class="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border-light shadow-2xl rounded-xl overflow-hidden z-50">
        <div class="flex items-center justify-between p-4 border-b border-border-light">
          <h3 class="text-lg font-bold text-main">Notifications</h3>
          <button *ngIf="notificationService.unreadCount() > 0" 
                  (click)="markAllAsRead()"
                  class="text-xs font-semibold text-brand-light hover:text-brand transition-colors">
            Mark all as read
          </button>
        </div>

        <div class="max-h-[400px] overflow-y-auto custom-scrollbar">
          <div *ngIf="notificationService.notifications().length === 0" class="p-6 text-center text-slate-500">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p class="text-sm">You have no notifications.</p>
          </div>

          <div *ngFor="let notif of notificationService.notifications()" 
               class="p-4 border-b border-border-light/50 hover:bg-input-bg transition-colors cursor-pointer group flex gap-3 relative"
               [ngClass]="{'bg-brand/5': !notif.read_at}"
               (click)="markAsRead(notif.id)">
               
            <!-- Unread Indicator Line -->
            <div *ngIf="!notif.read_at" class="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r"></div>

            <div class="flex-shrink-0 mt-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                   [ngClass]="notif.read_at ? 'bg-slate-500/10 text-slate-400' : 'bg-brand/20 text-brand-light'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-sm text-main font-medium mb-0.5 line-clamp-2" [class.font-bold]="!notif.read_at">
                {{ notif.data.message || 'New notification' }}
              </p>
              <p class="text-xs text-muted">
                {{ notif.created_at | date:'short' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="p-3 border-t border-border-light text-center">
          <a class="text-xs text-muted hover:text-main cursor-pointer transition-colors font-medium">View all notifications</a>
        </div>
      </div>
    </div>
  `
})
export class NotificationDropdownComponent {
  public notificationService = inject(NotificationService);
  private eRef = inject(ElementRef);
  
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.notificationService.notifications().length === 0) {
      this.notificationService.fetchNotifications().subscribe();
    }
  }

  markAsRead(id: string) {
    const notif = this.notificationService.notifications().find(n => n.id === id);
    if (notif && !notif.read_at) {
      this.notificationService.markAsRead(id).subscribe();
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
