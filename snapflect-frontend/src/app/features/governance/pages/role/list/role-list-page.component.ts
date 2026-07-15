import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';
import { UserStore } from '../../../../../shared/stores/user.store';
import { AppPageHeaderComponent } from '../../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../../shared/components/app-data-table-shell/app-data-table-shell.component';
import { StatusBadgeComponent } from '../../../../../shared/components/app-status-badge/app-status-badge.component';

interface Role {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number | null;
    role_code: string;
    role_name: string;
    description: string;
    is_system_role: boolean;
    status: string;
  };
  relationships?: {
    permissions?: any[];
  };
}

interface Organization {
  id: number;
  attributes: {
    organization_name: string;
  };
}

interface Permission {
  id: number;
  uuid: string;
  attributes: {
    permission_code: string;
    permission_name: string;
    module: string;
  };
}

@Component({
  selector: 'app-role-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Roles" subtitle="Manage RBAC roles and assign permissions via the matrix.">
        <button action *ngIf="userStore.hasAnyPermission(['Security.Roles.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Role
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="roles | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search roles..."
        emptyMessage="No roles found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-role>
          <tr>
            <td class="font-medium text-brand-light">{{ role.attributes.role_code }}</td>
            <td class="text-main font-medium">
              {{ role.attributes.role_name }}
              <p class="text-xs text-slate-500 mt-1 font-normal">{{ role.attributes.description }}</p>
            </td>
            <td>
              <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs" *ngIf="role.attributes.is_system_role">System</span>
              <span class="bg-slate-500/10 text-muted border border-slate-500/20 px-2 py-0.5 rounded text-xs" *ngIf="!role.attributes.is_system_role">Custom</span>
            </td>
            <td>
              <app-status-badge [status]="role.attributes.status"></app-status-badge>
            </td>
            <td class="text-right space-x-3">
              <button *ngIf="userStore.hasAnyPermission(['Security.Roles.Manage'])" class="text-brand-light hover:text-main transition-colors text-xs font-medium uppercase" (click)="openPermissionsModal(role)">Permissions</button>
              <button *ngIf="userStore.hasAnyPermission(['Security.Roles.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(role)">Edit</button>
              <button *ngIf="!role.attributes.is_system_role && userStore.hasAnyPermission(['Security.Roles.Manage'])" class="text-muted hover:text-red-400 transition-colors" (click)="deleteRole(role.uuid)">Delete</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- Create / Edit Role Form SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Role' : 'Create Role'" 
                      description="Manage the configuration for this role."
                      (closeEvent)="closeForm()">
        <form [formGroup]="roleForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div *ngIf="isPlatformAdmin">
            <label class="block text-sm font-medium text-muted mb-1">Organization (Optional)</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null">Global (System-wide)</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Role Code (Optional)</label>
            <input type="text" formControlName="role_code" class="input-field" placeholder="Leave blank to auto-generate">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Role Name *</label>
            <input type="text" formControlName="role_name" class="input-field" placeholder="e.g. Content Editor">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-24 resize-none" placeholder="What does this role do?"></textarea>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="roleForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Role</span>
            </button>
          </div>
        </form>
      </app-slide-over>

      <!-- Assign Permissions Matrix Modal (Full Screen or Large Modal) -->
      <div *ngIf="isPermissionsModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="bg-card glass-card w-full max-w-5xl h-[85vh] flex flex-col rounded-xl border border-border-light shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="p-6 border-b border-border-light flex justify-between items-center bg-input-bg">
            <div>
              <h3 class="text-xl font-bold text-main">Manage Permissions</h3>
              <p class="text-sm text-brand-light font-medium mt-1">Role: {{ activeRoleForPermissions?.attributes?.role_name }}</p>
            </div>
            <button class="text-muted hover:text-main" (click)="closePermissionsModal()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <!-- Body: The Matrix -->
          <div class="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
            <div *ngIf="permissionsLoading" class="text-center py-12 text-muted">Loading permission matrix...</div>
            
            <div *ngIf="!permissionsLoading" class="space-y-8">
              
              <div *ngFor="let module of objectKeys(groupedPermissions)" class="hover:brightness-110 border border-border-light rounded-lg overflow-hidden">
                <div class="bg-input-bg px-4 py-3 border-b border-border-light flex items-center justify-between">
                  <h4 class="font-semibold text-main capitalize">{{ module }} Module</h4>
                </div>
                
                <div class="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <label *ngFor="let perm of groupedPermissions[module]" 
                         class="flex items-start space-x-3 p-3 rounded-lg hover:hover:brightness-110 cursor-pointer transition-colors border border-transparent hover:border-white/5 group">
                    <div class="flex-shrink-0 pt-0.5">
                      <input type="checkbox" 
                             [checked]="isPermissionSelected(perm.uuid)"
                             (change)="togglePermission(perm.uuid)"
                             class="w-4 h-4 rounded border-white/20 bg-black/50 text-brand focus:ring-brand focus:ring-offset-0">
                    </div>
                    <div>
                      <span class="block text-sm font-medium text-main group-hover:text-main transition-colors leading-tight">
                        {{ formatPermissionName(perm.attributes.permission_code) }}
                      </span>
                      <span class="block text-[10px] text-slate-500 mt-1 tracking-wider">
                        {{ perm.attributes.permission_code }}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-border-light bg-input-bg flex justify-between items-center">
            <span class="text-sm text-muted">{{ selectedPermissionUuids.size }} permissions selected</span>
            <div class="space-x-3 flex">
              <button class="btn-secondary" (click)="closePermissionsModal()">Cancel</button>
              <button class="btn-primary" (click)="savePermissions()" [disabled]="savingPermissions">
                {{ savingPermissions ? 'Saving Matrix...' : 'Save Permissions' }}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
})
export class RoleListPageComponent implements OnInit {
  roles: Role[] = [];
  organizations: Organization[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  // Permissions Matrix State
  isPermissionsModalOpen = false;
  activeRoleForPermissions: Role | null = null;
  permissionsLoading = false;
  savingPermissions = false;
  isPermissionsDirty = false;
  
  allPermissions: Permission[] = [];
  groupedPermissions: Record<string, Permission[]> = {};
  selectedPermissionUuids: Set<string> = new Set();
  
  roleForm: FormGroup;
  objectKeys = Object.keys;
  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public userStore = inject(UserStore);

  isPlatformAdmin = false;

  constructor() {
    this.roleForm = this.fb.group({
      organization_id: [null],
      role_code: [''],
      role_name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.fetchRoles();
    this.fetchAllPermissions(); // Pre-load permissions for matrix
    this.fetchOrganizations();
    this.isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN']);
  }

  fetchOrganizations() {
    this.http.get<any>(`${environment.apiUrl}/governance/organizations?per_page=100`)
      .subscribe({
        next: (response) => {
          this.organizations = response.data ? response.data : response;
        },
        error: (err) => {
          console.error('Error fetching organizations', err);
        }
      });
  }

  fetchRoles() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/security/roles?include=permissions`)
      .subscribe({
        next: (response) => {
          this.roles = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching roles', err);
          this.loading = false;
        }
      });
  }

  fetchAllPermissions() {
    this.http.get<any>(`${environment.apiUrl}/security/permissions?per_page=500`)
      .subscribe({
        next: (response) => {
          const perms: Permission[] = response.data ? response.data : response;
          this.allPermissions = perms;
          
          // Group by module
          this.groupedPermissions = {};
          for (const p of perms) {
            const mod = p.attributes.module || 'General';
            if (!this.groupedPermissions[mod]) {
              this.groupedPermissions[mod] = [];
            }
            this.groupedPermissions[mod].push(p);
          }
        },
        error: (err) => {
          console.error('Error fetching all permissions for matrix', err);
        }
      });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.roleForm.enable();
    this.roleForm.reset();
    this.isSlideOverOpen = true;
  }

  openEditForm(role: Role) {
    this.isEditing = true;
    this.currentEditUuid = role.uuid;
    this.roleForm.enable();
    this.roleForm.patchValue({
      organization_id: role.attributes.organization_id, // Could be null for system
      role_code: role.attributes.role_code,
      role_name: role.attributes.role_name,
      description: role.attributes.description
    });
    // Intentionally restrict changing the structural code and organization for existing roles
    this.roleForm.get('role_code')?.disable();
    this.roleForm.get('organization_id')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.roleForm.dirty) {
      const confirmed = await this.confirmService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      });
      if (!confirmed) return;
    }
    this.isSlideOverOpen = false;
  }

  submitForm() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.roleForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/security/roles/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Role Updated', 'The role has been successfully updated.');
            this.closeForm(true);
            this.fetchRoles();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update role.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/security/roles`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Role Created', 'The new role has been successfully created.');
            this.closeForm(true);
            this.fetchRoles();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create role.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteRole(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/security/roles/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Role Deleted', 'The role was removed successfully.');
            this.fetchRoles();
          }
        });
    }
  }

  // --- Permissions Matrix Logic --- //

  openPermissionsModal(role: Role) {
    this.activeRoleForPermissions = role;
    this.selectedPermissionUuids.clear();
    
    // Check if role has relationships.permissions loaded
    if (role.relationships && role.relationships.permissions) {
      role.relationships.permissions.forEach((p: any) => {
        this.selectedPermissionUuids.add(p.uuid);
      });
    } else {
      // If we didn't get them via include, we might need to fetch a single role, but we did ?include=permissions
    }
    
    this.isPermissionsDirty = false;
    this.isPermissionsModalOpen = true;
  }

  async closePermissionsModal(force: boolean = false) {
    if (!force && this.isPermissionsDirty) {
      const confirmed = await this.confirmService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes to the permissions matrix. Are you sure you want to discard them?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      });
      if (!confirmed) return;
    }
    this.isPermissionsModalOpen = false;
    this.activeRoleForPermissions = null;
  }

  isPermissionSelected(uuid: string): boolean {
    return this.selectedPermissionUuids.has(uuid);
  }

  togglePermission(uuid: string) {
    this.isPermissionsDirty = true;
    if (this.selectedPermissionUuids.has(uuid)) {
      this.selectedPermissionUuids.delete(uuid);
    } else {
      this.selectedPermissionUuids.add(uuid);
    }
  }

  savePermissions() {
    if (!this.activeRoleForPermissions) return;
    
    this.savingPermissions = true;
    const roleUuid = this.activeRoleForPermissions.uuid;
    const payload = {
      permission_uuids: Array.from(this.selectedPermissionUuids)
    };
    
    this.http.post(`${environment.apiUrl}/security/roles/${roleUuid}/permissions`, payload)
      .subscribe({
        next: () => {
          this.savingPermissions = false;
          this.toastService.success('Permissions Saved', 'The role permissions have been updated successfully.');
          this.closePermissionsModal(true);
          this.fetchRoles(); // Refresh the roles list to get updated permissions
        },
        error: (err) => {
          this.savingPermissions = false;
          const msg = err.error?.message || 'Failed to save permissions.';
          this.toastService.error('Error', msg);
        }
      });
  }

  formatPermissionName(code: string): string {
    if (!code) return '';
    const parts = code.split('.');
    
    // Convert CamelCase to Words (e.g., "QuestionBanks" -> "Question Banks")
    const toWords = (str: string) => str.replace(/([A-Z])/g, ' $1').trim();
    
    if (parts.length >= 3) {
      // e.g. "Assessment.QuestionBanks.Manage" -> "Manage Question Banks"
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