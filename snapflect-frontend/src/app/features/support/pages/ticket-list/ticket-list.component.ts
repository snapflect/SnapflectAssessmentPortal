import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UserStore } from '../../../../shared/stores/user.store';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Support Tickets</h2>
          <p class="text-muted text-sm mt-1">Manage and track support requests</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary flex items-center shadow-lg hover:shadow-brand/20">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          New Ticket
        </button>
      </div>

      <!-- Ticket Queue -->
      <div class="flex-1 glass-card overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Ticket ID</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Subject</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm" *ngIf="isPlatformAdmin">Organization</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Status</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Priority</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Created</th>
                <th scope="col" class="px-6 py-4 font-semibold text-sm">Replies</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngIf="loading()" class="animate-pulse">
                <td colspan="7" class="px-6 py-12 text-center text-muted">
                   <div class="flex flex-col items-center justify-center">
                    <svg class="animate-spin h-8 w-8 text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading tickets...
                   </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && tickets().length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                  <svg class="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  <p class="text-lg font-medium text-main mb-1">No tickets found</p>
                  <p class="text-sm">There are no open support tickets at the moment.</p>
                </td>
              </tr>
              <tr *ngFor="let ticket of tickets()" 
                  (click)="viewTicket(ticket.id)"
                  class="hover:bg-white/5 cursor-pointer transition-colors group">
                <td class="px-6 py-4">
                  <span class="font-mono text-xs text-brand-light group-hover:text-brand transition-colors">#{{ ticket.id.toString().padStart(5, '0') }}</span>
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium text-main truncate max-w-xs">{{ ticket.subject }}</p>
                  <p class="text-xs text-muted mt-1">{{ ticket.user?.first_name }} {{ ticket.user?.last_name }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-300" *ngIf="isPlatformAdmin">
                  {{ ticket.organization?.organization_name }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider"
                        [ngClass]="{
                          'bg-success/10 text-success border border-success/20': ticket.status === 'OPEN',
                          'bg-warning/10 text-warning border border-warning/20': ticket.status === 'IN_PROGRESS',
                          'bg-surface-light text-muted border border-border': ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                        }">
                    {{ ticket.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="flex items-center text-xs font-medium"
                        [ngClass]="{
                          'text-muted': ticket.priority === 'LOW',
                          'text-info': ticket.priority === 'MEDIUM',
                          'text-warning': ticket.priority === 'HIGH',
                          'text-danger': ticket.priority === 'CRITICAL'
                        }">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    {{ ticket.priority }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-muted">
                  {{ ticket.created_at | date:'MMM d, y' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center text-muted text-sm">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    {{ ticket.replies_count || 0 }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Create Ticket Slider -->
    <div *ngIf="showModal()" class="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-page border-l border-white/10 shadow-2xl w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div class="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 class="text-lg font-bold text-main">Create Support Ticket</h3>
          <button (click)="closeModal()" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-main transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Subject</label>
              <input type="text" #subject class="input-field w-full" placeholder="Brief description of the issue">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select #priority class="input-field w-full">
                <option value="LOW">Low</option>
                <option value="MEDIUM" selected>Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div class="flex-1 flex flex-col h-full">
              <label class="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea #description rows="10" class="input-field w-full flex-1 min-h-[200px] custom-scrollbar" placeholder="Please provide detailed information about the issue..."></textarea>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-end space-x-3 mt-auto">
          <button (click)="closeModal()" class="btn-secondary">Cancel</button>
          <button (click)="submitTicket(subject.value, description.value, priority.value)" class="btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Submitting...' : 'Submit Ticket' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class TicketListComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userStore = inject(UserStore);

  tickets = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  submitting = signal(false);

  get isPlatformAdmin(): boolean {
    return this.userStore.hasAnyRole(['PLATFORM_ADMIN']) || this.userStore.profile()?.organization_name === 'Snapflect Assessment Portal';
  }

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/support/tickets`).subscribe({
      next: (res) => {
        this.tickets.set(res.data.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  viewTicket(id: number) {
    this.router.navigate(['/support/tickets', id]);
  }

  openCreateModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  submitTicket(subject: string, description: string, priority: string) {
    if (!subject || !description) return;
    
    this.submitting.set(true);
    this.http.post(`${environment.apiUrl}/support/tickets`, {
      subject, description, priority
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadTickets();
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }
}
