import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UserStore } from '../../../../shared/stores/user.store';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col max-w-5xl mx-auto" *ngIf="ticket()">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <a routerLink="/support/tickets" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-main transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </a>
          <div>
            <div class="flex items-center space-x-3">
              <h2 class="text-2xl font-bold text-main">{{ ticket().subject }}</h2>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider"
                    [ngClass]="{
                      'bg-success/10 text-success border border-success/20': ticket().status === 'OPEN',
                      'bg-warning/10 text-warning border border-warning/20': ticket().status === 'IN_PROGRESS',
                      'bg-surface-light text-muted border border-border': ticket().status === 'RESOLVED' || ticket().status === 'CLOSED'
                    }">
                {{ ticket().status.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-muted text-sm mt-1">
              Ticket #{{ ticket().id.toString().padStart(5, '0') }} • Created by {{ ticket().user?.first_name }} {{ ticket().user?.last_name }} on {{ ticket().created_at | date:'MMM d, y, h:mm a' }}
            </p>
          </div>
        </div>
        
        <!-- Status Update Actions (For Support Agents) -->
        <div class="flex items-center space-x-2" *ngIf="hasManagePermission()">
          <select #statusSelect (change)="updateStatus(statusSelect.value)" class="input-field text-sm py-2">
            <option value="OPEN" [selected]="ticket().status === 'OPEN'">Open</option>
            <option value="IN_PROGRESS" [selected]="ticket().status === 'IN_PROGRESS'">In Progress</option>
            <option value="RESOLVED" [selected]="ticket().status === 'RESOLVED'">Resolved</option>
            <option value="CLOSED" [selected]="ticket().status === 'CLOSED'">Closed</option>
          </select>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-6 pr-2">
        <!-- Original Description -->
        <div class="glass-card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-bold">
              {{ ticket().user?.first_name?.charAt(0) }}{{ ticket().user?.last_name?.charAt(0) }}
            </div>
            <div>
              <p class="font-medium text-main">{{ ticket().user?.first_name }} {{ ticket().user?.last_name }}</p>
              <p class="text-xs text-muted">User</p>
            </div>
          </div>
          <div class="text-slate-300 whitespace-pre-wrap leading-relaxed">{{ ticket().description }}</div>
        </div>

        <!-- Replies Thread -->
        <div *ngFor="let reply of ticket().replies" class="glass-card p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                 [ngClass]="reply.user_id === ticket().user_id ? 'bg-brand/20 text-brand-light' : 'bg-warning/20 text-warning'">
              {{ reply.user?.first_name?.charAt(0) }}{{ reply.user?.last_name?.charAt(0) }}
            </div>
            <div>
              <p class="font-medium text-main">
                {{ reply.user?.first_name }} {{ reply.user?.last_name }}
                <span *ngIf="reply.user_id !== ticket().user_id" class="ml-2 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20">Support Agent</span>
              </p>
              <p class="text-xs text-muted">{{ reply.created_at | date:'MMM d, y, h:mm a' }}</p>
            </div>
          </div>
          <div class="text-slate-300 whitespace-pre-wrap leading-relaxed">{{ reply.message }}</div>
        </div>
      </div>

      <!-- Reply Box -->
      <div class="mt-4 bg-input-bg border border-border-light rounded-xl p-4 shadow-lg">
        <textarea #replyBox rows="3" class="w-full bg-transparent border-none text-main placeholder-muted focus:ring-0 resize-none" placeholder="Type your reply here..."></textarea>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-border-light">
          <p class="text-xs text-muted">Responses will be visible to everyone on this thread.</p>
          <button (click)="submitReply(replyBox.value); replyBox.value=''" class="btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Sending...' : 'Send Reply' }}
          </button>
        </div>
      </div>
    </div>
    
    <div *ngIf="loading()" class="h-full flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-light"></div>
    </div>
  `
})
export class TicketDetailComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private userStore = inject(UserStore);

  ticket = signal<any>(null);
  loading = signal(true);
  submitting = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTicket(id);
      }
    });
  }

  hasManagePermission() {
    return this.userStore.hasAnyPermission(['Support.Tickets.Manage']);
  }

  loadTicket(id: string) {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/support/tickets/${id}`).subscribe({
      next: (res) => {
        this.ticket.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  submitReply(message: string) {
    if (!message || !message.trim()) return;
    
    this.submitting.set(true);
    this.http.post(`${environment.apiUrl}/support/tickets/${this.ticket().id}/replies`, {
      message: message.trim()
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.loadTicket(this.ticket().id.toString());
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  updateStatus(status: string) {
    this.http.put(`${environment.apiUrl}/support/tickets/${this.ticket().id}/status`, {
      status
    }).subscribe({
      next: () => {
        this.loadTicket(this.ticket().id.toString());
      }
    });
  }
}
