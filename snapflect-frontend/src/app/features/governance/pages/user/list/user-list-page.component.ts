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

interface User {
  id: number;
  uuid: string;
  attributes: {
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    organization_id?: number;
  };
  relationships?: {
    roles?: any[];
  };
}

interface Organization {
  id: number;
  attributes: {
    organization_name: string;
  };
}

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Users &amp; Roles</h2>
          <p class="text-muted text-sm mt-1">Manage platform access, identities, and RBAC permissions.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Invite User
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search users by email...">
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Email</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium">Roles</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && users.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading users...
                </td>
              </tr>
              <ng-container *ngIf="users | globalSearch: searchTerm as filteredUsers">
                <tr *ngIf="!loading && filteredUsers.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let user of filteredUsers" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-main">{{ user.attributes.first_name }} {{ user.attributes.last_name }}</td>
                  <td class="px-6 py-4">{{ user.attributes.email }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                          [ngClass]="user.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ user.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span *ngIf="!user.relationships?.roles || user.relationships?.roles?.length === 0" class="text-slate-500 italic text-xs">No roles assigned</span>
                      <span *ngFor="let role of user.relationships?.roles" class="bg-brand/20 text-brand-light border border-brand/30 px-2 py-0.5 rounded text-xs">
                        {{ role.attributes?.role_name || 'Role' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <!-- Fix 7: Manage Roles only visible to PLATFORM_ADMIN -->
                    <button *ngIf="isPlatformAdmin"
                            class="text-brand-light hover:text-main transition-colors text-xs font-medium uppercase"
                            (click)="openRoleModal(user)">Manage Roles</button>
                    <button class="text-muted hover:text-main transition-colors" (click)="openEditForm(user)">Edit</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit User Form SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen"
                      [title]="isEditing ? 'Edit User' : 'Invite User'"
                      description="Create a new identity profile in the system."
                      (closeEvent)="closeForm()">
        <form [formGroup]="userForm" (ngSubmit)="submitForm()" class="space-y-6">

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">First Name *</label>
              <input type="text" formControlName="first_name" class="input-field" placeholder="John">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Last Name *</label>
              <input type="text" formControlName="last_name" class="input-field" placeholder="Doe">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Email Address *</label>
            <input type="email" formControlName="email" class="input-field" placeholder="john.doe@company.com">
          </div>

          <div *ngIf="!isEditing">
            <label class="block text-sm font-medium text-muted mb-1">Temporary Password *</label>
            <input type="password" formControlName="password" class="input-field" placeholder="Min 12 chars">
            <p class="text-xs text-slate-500 mt-1">Must be at least 12 characters long.</p>
          </div>

          <!-- Fix 8: Optional initial role assignment during user creation -->
          <div *ngIf="!isEditing && isPlatformAdmin" class="border-t border-border-light pt-4">
            <label class="block text-sm font-medium text-muted mb-1">Initial Role <span class="text-slate-500 font-normal">(optional)</span></label>
            <select formControlName="initial_role_uuid" class="input-field">
              <option [ngValue]="null">No role — assign later via Manage Roles</option>
              <option *ngFor="let role of allRoles" [ngValue]="role.uuid">{{ role.attributes.role_name }}</option>
            </select>
            <p class="text-xs text-slate-500 mt-1">The selected role will be automatically assigned after the user is created.</p>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="userForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save User</span>
            </button>
          </div>
        </form>
      </app-slide-over>

      <!-- Manage Roles SlideOver -->
      <app-slide-over [isOpen]="isRoleModalOpen"
                      [title]="'Manage Roles: ' + (activeUserForRole?.attributes?.first_name || '') + ' ' + (activeUserForRole?.attributes?.last_name || '')"
                      description="Assign or revoke roles for this user."
                      (closeEvent)="closeRoleModal()">
        
        <div *ngIf="rolesLoading" class="text-center py-8 text-muted text-sm">
          <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading roles...
        </div>

        <ng-container *ngIf="!rolesLoading">
          <!-- Current Roles Section -->
          <div class="mb-6">
            <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Current Roles</h4>
            <div *ngIf="activeUserRoles.length === 0" class="text-sm text-slate-500 italic py-3 px-4 rounded-lg bg-input-bg border border-white/5">
              No roles assigned yet.
            </div>
            <div *ngFor="let role of activeUserRoles" class="flex items-center justify-between p-3 rounded-lg border border-border-light bg-brand/10 mb-2">
              <div class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-brand-light flex-shrink-0"></span>
                <div>
                  <span class="block text-sm font-medium text-main">{{ role.attributes.role_name }}</span>
                  <span class="block text-xs text-slate-500">{{ role.attributes.role_code }}</span>
                </div>
              </div>
              <button (click)="revokeRole(role)"
                      [disabled]="role._revoking"
                      class="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-2.5 py-1 rounded transition-colors disabled:opacity-50">
                {{ role._revoking ? 'Revoking...' : 'Revoke' }}
              </button>
            </div>
          </div>

          <!-- Add a Role Section -->
          <div>
            <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Add a Role</h4>
            <div *ngIf="unassignedRoles.length === 0" class="text-sm text-slate-500 italic py-3 px-4 rounded-lg bg-input-bg border border-white/5">
              All available roles have been assigned.
            </div>
            <div *ngFor="let role of unassignedRoles" class="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-input-bg hover:hover:brightness-110 mb-2 transition-colors">
              <div>
                <span class="block text-sm font-medium text-main">{{ role.attributes.role_name }}</span>
                <span class="block text-xs text-slate-500">{{ role.attributes.role_code }}</span>
              </div>
              <button (click)="assignRole(role)"
                      [disabled]="role._assigning"
                      class="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 px-2.5 py-1 rounded transition-colors disabled:opacity-50">
                {{ role._assigning ? 'Assigning...' : '+ Assign' }}
              </button>
            </div>
          </div>
        </ng-container>

        <div class="pt-6 flex justify-end mt-8 border-t border-border-light">
          <button class="btn-secondary" (click)="closeRoleModal()">Close</button>
        </div>
      </app-slide-over>

    </div>
  `
})
export class UserListPageComponent implements OnInit {
  users: User[] = [];
  organizations: Organization[] = [];
  loading = true;
  searchTerm = '';

  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;

  // Fix 7: Platform admin flag — derived from the authenticated user's roles
  isPlatformAdmin = false;

  // Fix 7: Role Modal State — full management panel
  isRoleModalOpen = false;
  activeUserForRole: User | null = null;
  allRoles: any[] = [];         // All roles fetched from API (cached)
  activeUserRoles: any[] = [];  // Currently assigned roles for the modal user
  unassignedRoles: any[] = [];  // Roles not yet assigned to the modal user
  rolesLoading = false;

  userForm: FormGroup;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private userStore = inject(UserStore);

  constructor() {
    this.userForm = this.fb.group({
      organization_id: [null, Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(12)],
      initial_role_uuid: [null]  // Fix 8: Optional role during creation
    });
  }

  ngOnInit() {
    this.fetchUsers();
    this.fetchOrganizations();
    // Fix 7: Derive PLATFORM_ADMIN status from the UserStore (populated at login)
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

  fetchUsers() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/security/users?include=roles`)
      .subscribe({
        next: (response) => {
          this.users = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching users', err);
          this.loading = false;
        }
      });
  }

  fetchAllRoles(): Promise<void> {
    if (this.allRoles.length > 0) return Promise.resolve(); // cached
    this.rolesLoading = true;
    return new Promise((resolve) => {
      this.http.get<any>(`${environment.apiUrl}/security/roles`).subscribe({
        next: (response) => {
          this.allRoles = response.data ? response.data : response;
          this.rolesLoading = false;
          resolve();
        },
        error: (err) => {
          console.error('Error fetching roles', err);
          this.rolesLoading = false;
          resolve();
        }
      });
    });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.userForm.enable();
    this.userForm.reset({ organization_id: this.organizations.length > 0 ? this.organizations[0].id : null, initial_role_uuid: null });
    // Require password for create
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(12)]);
    this.userForm.get('password')?.updateValueAndValidity();
    // Pre-fetch roles for the optional initial role dropdown
    if (this.isPlatformAdmin) {
      this.fetchAllRoles();
    }
    this.isSlideOverOpen = true;
  }

  openEditForm(user: User) {
    this.isEditing = true;
    this.currentEditUuid = user.uuid;
    this.userForm.enable();
    // Password is not required for edit
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      organization_id: user.attributes?.organization_id ?? (this.organizations.length > 0 ? this.organizations[0].id : null),
      first_name: user.attributes.first_name,
      last_name: user.attributes.last_name,
      email: user.attributes.email,
      initial_role_uuid: null
    });
    this.userForm.get('organization_id')?.disable();
    // Intentionally restrict changing the primary identity email for existing users
    this.userForm.get('email')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.userForm.dirty) {
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
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const rawValue = this.userForm.getRawValue();
    const initialRoleUuid: string | null = rawValue.initial_role_uuid ?? null;

    // Strip fields not sent to the user API
    const payload: any = { ...rawValue };
    delete payload.initial_role_uuid;

    // Remove password if empty (during edit)
    if (this.isEditing && !payload.password) {
      delete payload.password;
    }

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/security/users/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('User Updated', 'The user profile has been successfully updated.');
            this.closeForm(true);
            this.fetchUsers();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update user.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      // Fix 8: Create user then optionally assign initial role
      this.http.post<any>(`${environment.apiUrl}/security/users`, payload)
        .subscribe({
          next: (createResponse) => {
            const newUserUuid: string = createResponse?.data?.uuid ?? createResponse?.uuid;
            if (initialRoleUuid && newUserUuid) {
              // Assign the initial role immediately after creation
              this.http.post(`${environment.apiUrl}/security/users/${newUserUuid}/roles/${initialRoleUuid}`, {})
                .subscribe({
                  next: () => {
                    this.submitting = false;
                    this.toastService.success('User Invited', 'The new user has been provisioned and the selected role assigned.');
                    this.closeForm(true);
                    this.fetchUsers();
                  },
                  error: () => {
                    // User was created but role assignment failed — non-fatal
                    this.submitting = false;
                    this.toastService.success('User Invited', 'User created successfully. Role assignment failed — use Manage Roles to assign manually.');
                    this.closeForm(true);
                    this.fetchUsers();
                  }
                });
            } else {
              this.submitting = false;
              this.toastService.success('User Invited', 'The new user has been provisioned and invited.');
              this.closeForm(true);
              this.fetchUsers();
            }
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to provision user.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  // --- Fix 7: Full Role Management --- //

  async openRoleModal(user: User) {
    this.activeUserForRole = user;
    this.isRoleModalOpen = true;
    await this.fetchAllRoles();
    this.refreshModalRoleLists();
  }

  closeRoleModal() {
    this.isRoleModalOpen = false;
    this.activeUserForRole = null;
    this.activeUserRoles = [];
    this.unassignedRoles = [];
    this.fetchUsers(); // Refresh grid to reflect any role changes
  }

  /** Splits allRoles into assigned (activeUserRoles) and unassigned lists for the modal */
  refreshModalRoleLists() {
    if (!this.activeUserForRole) return;
    const assignedUuids = new Set(
      (this.activeUserForRole.relationships?.roles ?? []).map((r: any) => r.uuid)
    );
    this.activeUserRoles = this.allRoles
      .filter(r => assignedUuids.has(r.uuid))
      .map(r => ({ ...r, _revoking: false }));
    this.unassignedRoles = this.allRoles
      .filter(r => !assignedUuids.has(r.uuid))
      .map(r => ({ ...r, _assigning: false }));
  }

  assignRole(role: any) {
    if (!this.activeUserForRole) return;
    role._assigning = true;
    const userUuid = this.activeUserForRole.uuid;

    this.http.post(`${environment.apiUrl}/security/users/${userUuid}/roles/${role.uuid}`, {})
      .subscribe({
        next: () => {
          role._assigning = false;
          this.toastService.success('Role Assigned', `${role.attributes.role_name} has been assigned.`);
          // Update in-memory user relationships and refresh modal lists
          if (this.activeUserForRole) {
            const currentRoles = this.activeUserForRole.relationships?.roles ?? [];
            this.activeUserForRole = {
              ...this.activeUserForRole,
              relationships: { ...this.activeUserForRole.relationships, roles: [...currentRoles, role] }
            };
          }
          this.refreshModalRoleLists();
        },
        error: (err) => {
          role._assigning = false;
          const msg = err.error?.message || 'Failed to assign role.';
          this.toastService.error('Error', msg);
        }
      });
  }

  revokeRole(role: any) {
    if (!this.activeUserForRole) return;
    role._revoking = true;
    const userUuid = this.activeUserForRole.uuid;

    this.http.delete(`${environment.apiUrl}/security/users/${userUuid}/roles/${role.uuid}`)
      .subscribe({
        next: () => {
          role._revoking = false;
          this.toastService.success('Role Revoked', `${role.attributes.role_name} has been removed.`);
          // Remove from in-memory user relationships and refresh modal lists
          if (this.activeUserForRole) {
            const remaining = (this.activeUserForRole.relationships?.roles ?? []).filter((r: any) => r.uuid !== role.uuid);
            this.activeUserForRole = {
              ...this.activeUserForRole,
              relationships: { ...this.activeUserForRole.relationships, roles: remaining }
            };
          }
          this.refreshModalRoleLists();
        },
        error: (err) => {
          role._revoking = false;
          const msg = err.error?.message || 'Failed to revoke role.';
          this.toastService.error('Error', msg);
        }
      });
  }
}