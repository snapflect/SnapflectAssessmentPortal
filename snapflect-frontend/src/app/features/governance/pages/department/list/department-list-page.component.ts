import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';
import { UserStore } from '../../../../../shared/stores/user.store';
import { AppPageHeaderComponent } from '../../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../../shared/components/app-data-table-shell/app-data-table-shell.component';
import { StatusBadgeComponent } from '../../../../../shared/components/app-status-badge/app-status-badge.component';
import { CountBadgeComponent } from '../../../../../shared/components/app-count-badge/app-count-badge.component';

interface Department {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number;
    business_unit_id: number;
    department_code: string;
    department_name: string;
    status: string;
  };
  relationships?: {
    business_unit?: {
      attributes: {
        business_unit_name: string;
      }
    };
    users_count?: number;
  };
}

interface Organization {
  id: number;
  uuid: string;
  attributes: {
    organization_name: string;
  };
}

interface BusinessUnit {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number;
    business_unit_name: string;
  };
}

@Component({
  selector: 'app-department-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent, CountBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Page Header -->
      <app-page-header title="Departments" subtitle="Manage hierarchical structure and team grouping.">
        <button action *ngIf="userStore.hasAnyPermission(['Governance.Departments.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Department
        </button>
      </app-page-header>

      <!-- Data Table -->
      <app-data-table-shell
        [loading]="loading"
        [items]="departments | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search departments..."
        emptyMessage="No departments found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Business Unit</th>
            <th>Code</th>
            <th>Name</th>
            <th class="text-center">Headcount</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-dept>
          <tr>
            <td class="text-muted">{{ dept.relationships?.business_unit?.attributes?.business_unit_name || '-' }}</td>
            <td class="font-medium text-brand-light">{{ dept.attributes.department_code }}</td>
            <td class="text-main font-medium">{{ dept.attributes.department_name }}</td>
            <td class="text-center">
              <app-count-badge [count]="dept.relationships?.users_count || 0" label="Users"></app-count-badge>
            </td>
            <td>
              <app-status-badge [status]="dept.attributes.status"></app-status-badge>
            </td>
            <td class="text-right space-x-3">
              <button *ngIf="userStore.hasAnyPermission(['Governance.Departments.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(dept)">Edit</button>
              <button *ngIf="userStore.hasAnyPermission(['Governance.Departments.Manage'])" class="text-muted hover:text-red-400 transition-colors" (click)="deleteDept(dept.uuid)">Delete</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Department' : 'Create Department'" 
                      description="Manage details for this organizational department."
                      (closeEvent)="closeForm()">
        <form [formGroup]="deptForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div *ngIf="isPlatformAdmin">
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field" (change)="onOrgChange()">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Business Unit *</label>
            <select formControlName="business_unit_id" class="input-field">
              <option [ngValue]="null" disabled>Select a Business Unit</option>
              <option *ngFor="let bu of filteredBusinessUnits" [ngValue]="bu.id">{{ bu.attributes.business_unit_name }}</option>
            </select>
            <p *ngIf="filteredBusinessUnits.length === 0 && deptForm.get('organization_id')?.value" class="text-xs text-amber-500 mt-1">No business units found for this organization.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Department Code (Optional)</label>
            <input type="text" formControlName="department_code" 
                   class="input-field" 
                   placeholder="Leave blank to auto-generate">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Department Name *</label>
            <input type="text" formControlName="department_name" 
                   class="input-field" 
                   placeholder="e.g. Engineering">
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="deptForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Department</span>
            </button>
          </div>
        </form>
      </app-slide-over>

    </div>
  `
})
export class DepartmentListPageComponent implements OnInit {
  departments: Department[] = [];
  organizations: Organization[] = [];
  businessUnits: BusinessUnit[] = [];
  filteredBusinessUnits: BusinessUnit[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  deptForm: FormGroup;
  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public userStore = inject(UserStore);

  isPlatformAdmin = false;

  constructor() {
    this.deptForm = this.fb.group({
      organization_id: [null, Validators.required],
      business_unit_id: [null, Validators.required],
      department_code: [''],
      department_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchDepartments();
    this.fetchOrganizations();
    this.isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN']);
  }

  fetchOrganizations() {
    this.http.get<any>(`${environment.apiUrl}/governance/organizations?per_page=100`)
      .subscribe({
        next: (response) => {
          this.organizations = response.data ? response.data : response;
        }
      });
  }

  onOrgChange() {
    const orgId = this.deptForm.get('organization_id')?.value;
    if (orgId) {
      this.http.get<any>(`${environment.apiUrl}/governance/business-units?per_page=100&organization_id=${orgId}`)
        .subscribe({
          next: (response) => {
            this.businessUnits = response.data ? response.data : response;
            this.filteredBusinessUnits = [...this.businessUnits];
          }
        });
    } else {
      this.filteredBusinessUnits = [];
    }
    this.deptForm.get('business_unit_id')?.setValue(null);
  }

  fetchDepartments() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/governance/departments`)
      .subscribe({
        next: (response) => {
          this.departments = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching departments', err);
          this.loading = false;
        }
      });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.deptForm.enable();
    const defaultOrg = this.organizations.length > 0 ? this.organizations[0].id : null;
    this.deptForm.reset({ organization_id: defaultOrg, business_unit_id: null });
    this.onOrgChange();
    this.isSlideOverOpen = true;
  }

  openEditForm(dept: Department) {
    this.isEditing = true;
    this.currentEditUuid = dept.uuid;
    this.deptForm.enable();
    
    // Set org first to filter business units
    this.deptForm.patchValue({
      organization_id: dept.attributes.organization_id
    });
    this.onOrgChange();
    
    this.deptForm.patchValue({
      business_unit_id: dept.attributes.business_unit_id,
      department_code: dept.attributes.department_code,
      department_name: dept.attributes.department_name
    });
    
    // In edit mode, we need to fetch BUs for the organization if we haven't already, or they might be empty initially.
    // onOrgChange fetches them asynchronously, so we must set the BU value after BUs are loaded.
    setTimeout(() => {
        this.deptForm.patchValue({ business_unit_id: dept.attributes.business_unit_id }, { emitEvent: false });
    }, 150);
    // Intentionally restrict changing the structural code and org/bu for existing departments
    this.deptForm.get('department_code')?.disable();
    this.deptForm.get('organization_id')?.disable();
    this.deptForm.get('business_unit_id')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.deptForm.dirty) {
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
    if (this.deptForm.invalid) {
      this.deptForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.deptForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/governance/departments/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Department Updated', 'The department has been successfully updated.');
            this.closeForm(true);
            this.fetchDepartments();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update department.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/governance/departments`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Department Created', 'The new department has been successfully created.');
            this.closeForm(true);
            this.fetchDepartments();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create department.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteDept(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Department',
      message: 'Are you sure you want to delete this department? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/governance/departments/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Department Deleted', 'The department was removed successfully.');
            this.fetchDepartments();
          }
        });
    }
  }
}