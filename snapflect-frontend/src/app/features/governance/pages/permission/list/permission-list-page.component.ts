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
          <h2 class="text-2xl font-bold text-white">System Permissions</h2>
          <p class="text-slate-400 text-sm mt-1">View all available permissions in the system. (Read-only list)</p>
        </div>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-surface-darker/50" placeholder="Search permissions...">
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="text-xs text-slate-400 uppercase bg-surface-dark sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Module</th>
                <th scope="col" class="px-6 py-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && permissions.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-400">
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
                <tr *ngFor="let perm of filteredPermissions" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ perm.attributes.permission_code }}</td>
                  <td class="px-6 py-4 text-white font-medium">{{ formatPermissionName(perm.attributes.permission_code) }}</td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium">{{ perm.attributes.module || 'System' }}</span>
                  </td>
                  <td class="px-6 py-4 text-slate-400">{{ perm.attributes.description || 'System managed permission.' }}</td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PermissionListPageComponent implements OnInit {
  permissions: Permission[] = [];
  loading = true;
  searchTerm = '';
  private http = inject(HttpClient);

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