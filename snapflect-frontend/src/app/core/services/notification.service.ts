import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../shared/stores/auth.store';
import { tap, catchError, of, switchMap, timer, Subscription } from 'rxjs';

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);
  
  private pollingSub?: Subscription;

  constructor() {
    // Start polling when authenticated
    if (this.authStore.isAuthenticated()) {
      this.startPolling();
    }
  }

  startPolling() {
    // Poll every 15 seconds to simulate real-time
    this.pollingSub = timer(0, 15000).pipe(
      switchMap(() => this.fetchNotifications())
    ).subscribe();
  }

  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  fetchNotifications() {
    return this.http.get<any>(`${environment.apiUrl}/notifications`).pipe(
      tap(res => {
        this.notifications.set(res.data);
        this.unreadCount.set(res.meta.unread_count);
      }),
      catchError(err => {
        console.error('Failed to fetch notifications', err);
        return of(null);
      })
    );
  }

  markAsRead(id: string) {
    return this.http.post<any>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(res => {
        this.unreadCount.set(res.unread_count);
        this.notifications.update(nots => 
          nots.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
      })
    );
  }

  markAllAsRead() {
    return this.http.post<any>(`${environment.apiUrl}/notifications/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
        this.notifications.update(nots => 
          nots.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
      })
    );
  }
}
