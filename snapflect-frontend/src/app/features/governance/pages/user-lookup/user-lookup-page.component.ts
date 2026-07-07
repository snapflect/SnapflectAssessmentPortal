import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../../shared/stores/user.store';
import { environment } from '../../../../../environments/environment';
import { SlideOverComponent } from '../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-user-lookup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SlideOverComponent],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">User Lookup & Support</h2>
          <p class="text-muted text-sm mt-1">Search users to troubleshoot accounts, view activity, or perform support actions.</p>
        </div>
      </div>

      <div class="bg-card flex-1 p-6 border border-border-light shadow-lg rounded-xl flex flex-col min-h-0">
        <div class="flex justify-between items-center mb-6">
           <h3 class="font-bold text-main">Support Directory</h3>
           <div class="bg-input-bg border border-border-light rounded-lg px-4 py-2 flex items-center">
             <svg class="w-4 h-4 text-brand-light mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filterUsers()" placeholder="Search by name or email..." class="bg-transparent border-none focus:outline-none text-sm text-main w-64 placeholder:text-muted">
           </div>
        </div>
        
        <div class="table-responsive flex-1">
          <table class="w-full text-left border-collapse min-w-[800px]">
             <thead class="sticky top-0 bg-card z-10">
               <tr class="bg-input-bg">
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light rounded-tl-lg">User</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Email</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Account Status</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Last Login</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light text-right rounded-tr-lg">Support Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr *ngIf="isLoading">
                 <td colspan="5" class="p-8 text-center text-muted">
                   <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Loading users...
                 </td>
               </tr>
               <tr *ngIf="!isLoading && filteredUsers.length === 0">
                 <td colspan="5" class="p-8 text-center text-muted">No users found.</td>
               </tr>
               <tr *ngFor="let user of filteredUsers" class="border-b border-border-light hover:bg-input-bg transition-colors">
                 <td class="p-4">
                   <div class="text-sm font-medium text-main">{{ user.attributes.first_name }} {{ user.attributes.last_name }}</div>
                 </td>
                 <td class="p-4 text-sm text-muted">{{ user.attributes.email }}</td>
                 <td class="p-4">
                   <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                         [ngClass]="user.attributes.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'">
                     {{ user.attributes.status || 'ACTIVE' }}
                   </span>
                 </td>
                 <td class="p-4 text-sm text-muted">{{ user.attributes.last_login_at ? (user.attributes.last_login_at | date:'medium') : 'Never' }}</td>
                 <td class="p-4 text-right">
                   <div class="flex justify-end gap-2">
                     <button (click)="viewActivityLogs(user.uuid)" class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-brand-light">Activity Logs</button>
                     <button (click)="resetPassword(user.uuid)" class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-amber-500" [disabled]="actionLoading === user.uuid + 'reset'">{{ actionLoading === user.uuid + 'reset' ? 'Sending...' : 'Reset Password' }}</button>
                     <button (click)="forceLogout(user.uuid)" class="text-xs border border-border-light px-2 py-1 rounded hover:bg-white/5 transition-colors text-rose-500" [disabled]="actionLoading === user.uuid + 'logout'">{{ actionLoading === user.uuid + 'logout' ? 'Logging out...' : 'Force Logout' }}</button>
                   </div>
                 </td>
               </tr>
             </tbody>
          </table>
        </div>
      <!-- Activity Logs SlideOver -->
      <app-slide-over [isOpen]="isLogModalOpen"
                      [title]="'Activity Logs'"
                      description="Recent security and access events."
                      (closeEvent)="closeLogModal()">
        
        <div *ngIf="logsLoading" class="text-center py-8 text-muted text-sm">
          <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading logs...
        </div>

        <ng-container *ngIf="!logsLoading">
          <div *ngIf="activeLogs.length === 0" class="text-sm text-slate-500 italic py-3 px-4 rounded-lg bg-input-bg border border-white/5">
            No activity logs found.
          </div>
          <div *ngFor="let log of activeLogs" class="flex flex-col p-3 rounded-lg border border-border-light bg-brand/10 mb-2">
            <span class="block text-sm font-medium text-main">{{ log.action }}</span>
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs text-slate-500">{{ log.timestamp | date:'medium' }}</span>
              <span class="text-xs text-slate-500 font-mono">{{ log.ip_address }}</span>
            </div>
          </div>
        </ng-container>

        <div class="pt-6 flex justify-end mt-8 border-t border-border-light">
          <button class="btn-secondary" (click)="closeLogModal()">Close</button>
        </div>
      </app-slide-over>

    </div>
  `
})
export class UserLookupPageComponent implements OnInit {
  private userStore = inject(UserStore);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  isLoading = true;
  actionLoading: string | null = null;
  
  isLogModalOpen = false;
  logsLoading = false;
  activeLogs: any[] = [];

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/security/users`).subscribe({
      next: (res) => {
        const isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN']);
        let data = res.data ? res.data : (Array.isArray(res) ? res : []);
        
        // Hide platform admins from regular clients
        if (!isPlatformAdmin) {
           data = data.filter((u: any) => {
             const hasPlatformRole = u.relationships?.roles?.some((r: any) => r.role_code === 'PLATFORM_ADMIN');
             return !hasPlatformRole && u.attributes.email !== 'admin@snapflect.com';
           });
        }
        this.users = data;
        this.filterUsers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u => {
      const name = `${u.attributes.first_name} ${u.attributes.last_name}`.toLowerCase();
      const email = (u.attributes.email || '').toLowerCase();
      return name.includes(lowerTerm) || email.includes(lowerTerm);
    });
  }

  viewActivityLogs(uuid: string) {
    this.isLogModalOpen = true;
    this.logsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/security/users/${uuid}/activity`).subscribe({
      next: (res) => {
        this.activeLogs = res.data || [];
        this.logsLoading = false;
      },
      error: (err) => {
        this.activeLogs = [];
        this.logsLoading = false;
        this.toastService.error('Error', 'Failed to fetch activity logs.');
      }
    });
  }

  closeLogModal() {
    this.isLogModalOpen = false;
    this.activeLogs = [];
  }

  async resetPassword(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Reset Password',
      message: 'Are you sure you want to trigger a password reset for this user?',
      variant: 'warning',
      confirmText: 'Reset Password',
      cancelText: 'Cancel'
    });
    if (!confirmed) return;

    this.actionLoading = uuid + 'reset';
    this.http.post(`${environment.apiUrl}/security/users/${uuid}/reset-password`, {}).subscribe({
      next: () => {
        this.toastService.success('Success', 'Password has been reset successfully.');
        this.actionLoading = null;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to reset password.');
        this.actionLoading = null;
      }
    });
  }

  async forceLogout(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Force Logout',
      message: 'Are you sure you want to forcefully log out this user and invalidate their sessions?',
      variant: 'danger', // Using danger instead of warning for logout
      confirmText: 'Force Logout',
      cancelText: 'Cancel'
    });
    if (!confirmed) return;

    this.actionLoading = uuid + 'logout';
    this.http.post(`${environment.apiUrl}/security/users/${uuid}/force-logout`, {}).subscribe({
      next: () => {
        this.toastService.success('Success', 'User has been logged out successfully.');
        this.actionLoading = null;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to force logout.');
        this.actionLoading = null;
      }
    });
  }
}
