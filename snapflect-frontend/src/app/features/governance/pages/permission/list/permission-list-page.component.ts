import { UserStore } from '../../../../../shared/stores/user.store';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface Permission {
  id: number;
  uuid: string;
  attributes: {
    permission_code: string;
    permission_name: string;
    description: string;
    module: string;
    is_system_permission: boolean;
  };
}

@Component({
  selector: 'app-permission-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">System Permissions</h2>
          <p class="text-muted text-sm mt-1">Manage granular permissions across modules.</p>
        </div>
        <button *ngIf="userStore.hasAnyPermission(['Security.Roles.Manage'])" (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Create Permission
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search permissions...">
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Module</th>
                <th scope="col" class="px-6 py-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && permissions.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading permissions...
                </td>
              </tr>
              <ng-container *ngIf="permissions | globalSearch: searchTerm as filteredPermissions">
                <tr *ngIf="!loading && filteredPermissions.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                    No permissions found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let perm of filteredPermissions" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ perm.attributes.permission_code }}</td>
                  <td class="px-6 py-4 text-main font-medium">{{ perm.attributes.permission_name || formatPermissionName(perm.attributes.permission_code) }}</td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium">{{ perm.attributes.module || 'System' }}</span>
                  </td>
                  <td class="px-6 py-4 text-muted">{{ perm.attributes.description || 'System managed permission.' }}</td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border-light overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-border-light flex justify-between items-center bg-slate-800/50">
            <h3 class="font-bold text-main">Create Permission</h3>
            <button (click)="closeCreateModal()" class="text-muted hover:text-main transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-6 flex-1 overflow-y-auto">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-muted mb-1">Permission Code <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="newPermission.permission_code" placeholder="e.g. Content.Assessment.Create" class="input-field w-full">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-muted mb-1">Permission Name <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="newPermission.permission_name" placeholder="e.g. Create Assessment" class="input-field w-full">
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Module</label>
                <select [(ngModel)]="newPermission.module" class="input-field w-full">
                  <option value="Governance">Governance</option>
                  <option value="Security">Security</option>
                  <option value="Authoring">Authoring</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Results">Results</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-muted mb-1">Description</label>
                <textarea [(ngModel)]="newPermission.description" rows="3" class="input-field w-full" placeholder="Describe what this permission allows..."></textarea>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 bg-slate-900 border-t border-border-light flex justify-end gap-3">
            <button (click)="closeCreateModal()" class="btn-secondary">Cancel</button>
            <button (click)="createPermission()" class="btn-primary flex items-center gap-2" [disabled]="submitting">
              <svg *ngIf="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ submitting ? 'Saving...' : 'Save Permission' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class PermissionListPageComponent implements OnInit {
  permissions: Permission[] = [];
  loading = true;
  searchTerm = '';
  userStore = inject(UserStore);

  private http = inject(HttpClient);

  showCreateModal = false;
  submitting = false;
  newPermission = {
    permission_code: '',
    permission_name: '',
    module: 'Governance',
    description: ''
  };

  ngOnInit() {
    this.fetchPermissions();
  }

  fetchPermissions() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/security/permissions?per_page=100`)
      .subscribe({
        next: (response) => {
          this.permissions = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching permissions', err);
          this.loading = false;
        }
      });
  }

  openCreateModal() {
    this.newPermission = {
      permission_code: '',
      permission_name: '',
      module: 'Governance',
      description: ''
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createPermission() {
    if (!this.newPermission.permission_code || !this.newPermission.permission_name) {
      alert('Code and Name are required.');
      return;
    }
    
    this.submitting = true;
    this.http.post<any>(`${environment.apiUrl}/security/permissions`, this.newPermission)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showCreateModal = false;
          this.fetchPermissions();
        },
        error: (err) => {
          this.submitting = false;
          alert('Failed to create permission. It may already exist.');
          console.error(err);
        }
      });
  }

  formatPermissionName(code: string): string {
    if (!code) return '';
    const parts = code.split('.');
    
    // Convert CamelCase to Words (e.g., "QuestionBanks" -> "Question Banks")
    const toWords = (str: string) => str.replace(/([A-Z])/g, ' $1').trim();
    
    if (parts.length >= 3) {
      const action = parts[parts.length - 1];
      const entity = toWords(parts[parts.length - 2]);
      return `${action} ${entity}`;
    } else if (parts.length === 2) {
      const action = parts[1];
      const entity = toWords(parts[0]);
      return `${action} ${entity}`;
    }
    return code;
  }
}