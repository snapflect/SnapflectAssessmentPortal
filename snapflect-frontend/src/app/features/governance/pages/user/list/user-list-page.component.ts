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

interface User {
  id: number;
  uuid: string;
  attributes: {
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    organization_id?: number;
    business_unit_id?: number;
    department_id?: number;
    location_id?: number;
  };
  relationships?: {
    roles?: any[];
    business_unit?: { attributes: { business_unit_name: string } };
    department?: { attributes: { department_name: string } };
    location?: { attributes: { location_name: string } };
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Users &amp; Roles" subtitle="Manage platform access, identities, and RBAC permissions.">
        <button action *ngIf="userStore.hasAnyPermission(['Security.Users.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Invite User
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="users | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search users by email..."
        emptyMessage="No users found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Placement</th>
            <th>Status</th>
            <th>Roles</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-user>
          <tr>
            <td class="font-medium text-main">{{ user.attributes.first_name }} {{ user.attributes.last_name }}</td>
            <td>{{ user.attributes.email }}</td>
            <td>
              <div class="flex flex-col space-y-1">
                <span class="text-xs text-brand-light" *ngIf="user.relationships?.business_unit">BU: {{ user.relationships?.business_unit?.attributes?.business_unit_name }}</span>
                <span class="text-xs text-muted" *ngIf="user.relationships?.department">Dept: {{ user.relationships?.department?.attributes?.department_name }}</span>
                <span class="text-xs text-slate-400" *ngIf="user.relationships?.location">Loc: {{ user.relationships?.location?.attributes?.location_name }}</span>
                <span class="text-xs text-slate-500 italic" *ngIf="!user.relationships?.business_unit && !user.relationships?.department && !user.relationships?.location">No placement</span>
              </div>
            </td>
            <td>
              <app-status-badge [status]="user.attributes.status"></app-status-badge>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span *ngIf="!user.relationships?.roles || user.relationships?.roles?.length === 0" class="text-slate-500 italic text-xs">No roles assigned</span>
                <span *ngFor="let role of user.relationships?.roles" class="bg-brand/20 text-brand-light border border-brand/30 px-2 py-0.5 rounded text-xs">
                  {{ role.attributes?.role_name || 'Role' }}
                </span>
              </div>
            </td>
            <td class="text-right space-x-3">
              <button *ngIf="userStore.hasAnyPermission(['Security.Users.Manage'])" class="text-brand-light hover:text-main transition-colors text-xs font-medium uppercase"
                      (click)="openRoleModal(user)">Manage Roles</button>
              <button *ngIf="userStore.hasAnyPermission(['Security.Users.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(user)">Edit</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- Create / Edit User Form SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen"
                      [title]="isEditing ? 'Edit User' : 'Invite User'"
                      description="Create a new identity profile in the system."
                      (closeEvent)="closeForm()">
        <form [formGroup]="userForm" (ngSubmit)="submitForm()" class="space-y-6">

          <div *ngIf="isPlatformAdmin" class="pb-2">
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field" (change)="onOrgChange()">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <!-- Personal Information Section -->
          <div>
            <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Personal Information</h4>
            <div class="space-y-4">
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
            </div>
          </div>

          <!-- Role & Placement Section -->
          <div class="pt-4 border-t border-border-light">
            <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Role & Placement</h4>
            <div class="space-y-4 bg-input-bg/30 p-4 rounded-lg border border-white/5">
              
              <div *ngIf="!isEditing">
                <label class="block text-sm font-medium text-muted mb-1">Initial Role <span class="text-slate-500 font-normal">(optional)</span></label>
                <select formControlName="initial_role_uuid" class="input-field">
                  <option [ngValue]="null">No role — assign later</option>
                  <option *ngFor="let role of allRoles" [ngValue]="role.uuid">{{ role.attributes.role_name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-muted mb-1">Business Unit <span class="text-slate-500 font-normal">(optional)</span></label>
                <select formControlName="business_unit_id" class="input-field" (change)="onBUChange()">
                  <option [ngValue]="null">None</option>
                  <option *ngFor="let bu of filteredBusinessUnits" [ngValue]="bu.id">{{ bu.attributes.business_unit_name }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-muted mb-1">Department <span class="text-slate-500 font-normal">(optional)</span></label>
                  <select formControlName="department_id" class="input-field">
                    <option [ngValue]="null">None</option>
                    <option *ngFor="let dept of filteredDepartments" [ngValue]="dept.id">{{ dept.attributes.department_name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-muted mb-1">Location <span class="text-slate-500 font-normal">(optional)</span></label>
                  <select formControlName="location_id" class="input-field">
                    <option [ngValue]="null">None</option>
                    <option *ngFor="let loc of filteredLocations" [ngValue]="loc.id">{{ loc.attributes.location_name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-4">
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
              <button *ngIf="(userStore.hasAnyPermission(['Security.Users.Manage'])) && userStore.hasAnyPermission(['Security.Users.Manage'])"  (click)="revokeRole(role)"
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
              <button *ngIf="(userStore.hasAnyPermission(['Security.Users.Manage'])) && userStore.hasAnyPermission(['Security.Users.Manage'])"  (click)="assignRole(role)"
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

  businessUnits: any[] = [];
  filteredBusinessUnits: any[] = [];
  departments: any[] = [];
  filteredDepartments: any[] = [];
  locations: any[] = [];
  filteredLocations: any[] = [];

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
  public userStore = inject(UserStore);

  constructor() {
    this.userForm = this.fb.group({
      organization_id: [null, Validators.required],
      business_unit_id: [null],
      department_id: [null],
      location_id: [null],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(12)],
      initial_role_uuid: [null]  // Fix 8: Optional role during creation
    });
  }

  ngOnInit() {
    this.fetchOrganizations();
    // Fix 7: Derive PLATFORM_ADMIN status from the UserStore (populated at login)
    this.isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN']);
  }

  onOrgChange() {
    const orgId = this.userForm.get('organization_id')?.value;
    if (orgId) {
      this.http.get<any>(`${environment.apiUrl}/governance/business-units?per_page=100&organization_id=${orgId}`).subscribe({
        next: (res) => {
          this.businessUnits = res.data ? res.data : res;
          this.filteredBusinessUnits = [...this.businessUnits];
        }
      });
      this.http.get<any>(`${environment.apiUrl}/governance/locations?per_page=100&organization_id=${orgId}`).subscribe({
        next: (res) => {
          this.locations = res.data ? res.data : res;
          this.filteredLocations = [...this.locations];
        }
      });
    } else {
      this.filteredBusinessUnits = [];
      this.filteredLocations = [];
    }
    this.userForm.patchValue({ business_unit_id: null, department_id: null, location_id: null });
    this.onBUChange();
  }

  onBUChange() {
    const buId = this.userForm.get('business_unit_id')?.value;
    const orgId = this.userForm.get('organization_id')?.value;
    
    // We only fetch departments dynamically if the user changed the BU, or Org.
    // If we have an orgId, we fetch its departments. Then filter by BU on the client side.
    if (orgId) {
       this.http.get<any>(`${environment.apiUrl}/governance/departments?per_page=100&organization_id=${orgId}`).subscribe({
         next: (res) => {
            this.departments = res.data ? res.data : res;
            if (buId) {
              this.filteredDepartments = this.departments.filter(d => d.attributes.business_unit_id === buId);
            } else {
              this.filteredDepartments = [...this.departments];
            }
         }
       });
    } else {
      this.filteredDepartments = [];
    }
    
    this.userForm.patchValue({ department_id: null });
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
    const defaultOrgId = this.organizations.length > 0 ? this.organizations[0].id : null;
    this.userForm.reset({ organization_id: defaultOrgId, initial_role_uuid: null });
    
    // Trigger filters based on default org if any
    if (defaultOrgId) {
      setTimeout(() => this.onOrgChange(), 100);
    }

    // Require password for create
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(12)]);
    this.userForm.get('password')?.updateValueAndValidity();
    // Pre-fetch roles for the optional initial role dropdown
    this.fetchAllRoles();
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
      business_unit_id: user.attributes?.business_unit_id ?? null,
      department_id: user.attributes?.department_id ?? null,
      location_id: user.attributes?.location_id ?? null,
      first_name: user.attributes.first_name,
      last_name: user.attributes.last_name,
      email: user.attributes.email,
      initial_role_uuid: null
    });
    
    // Trigger filtering but preserve the patched values
    setTimeout(() => {
        const orgId = this.userForm.get('organization_id')?.value;
        const buId = this.userForm.get('business_unit_id')?.value;
        const deptId = this.userForm.get('department_id')?.value;
        const locId = this.userForm.get('location_id')?.value;
        
        if (orgId) {
            this.http.get<any>(`${environment.apiUrl}/governance/business-units?per_page=100&organization_id=${orgId}`).subscribe({
                next: (res) => {
                    this.businessUnits = res.data ? res.data : res;
                    this.filteredBusinessUnits = [...this.businessUnits];
                    this.userForm.patchValue({ business_unit_id: buId }, { emitEvent: false });
                }
            });
            this.http.get<any>(`${environment.apiUrl}/governance/locations?per_page=100&organization_id=${orgId}`).subscribe({
                next: (res) => {
                    this.locations = res.data ? res.data : res;
                    this.filteredLocations = [...this.locations];
                    this.userForm.patchValue({ location_id: locId }, { emitEvent: false });
                }
            });
            this.http.get<any>(`${environment.apiUrl}/governance/departments?per_page=100&organization_id=${orgId}`).subscribe({
                next: (res) => {
                    this.departments = res.data ? res.data : res;
                    if (buId) {
                        this.filteredDepartments = this.departments.filter(d => d.attributes.business_unit_id === buId);
                    } else {
                        this.filteredDepartments = [...this.departments];
                    }
                    this.userForm.patchValue({ department_id: deptId }, { emitEvent: false });
                }
            });
        }
    }, 100);

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
            const msg = this.extractErrorMessage(err) || 'Failed to update user.';
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
            const msg = this.extractErrorMessage(err) || 'Failed to provision user.';
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
          const msg = this.extractErrorMessage(err) || 'Failed to assign role.';
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
          const msg = this.extractErrorMessage(err) || 'Failed to revoke role.';
          this.toastService.error('Error', msg);
        }
      });
  }
  private extractErrorMessage(err: any): string | null {
    if (err?.error?.detail) {
      if (typeof err.error.detail === 'string') {
        return err.error.detail;
      } else if (typeof err.error.detail === 'object') {
        const keys = Object.keys(err.error.detail);
        if (keys.length > 0) {
          return err.error.detail[keys[0]][0];
        }
      }
    }
    return err?.error?.message || null;
  }
}