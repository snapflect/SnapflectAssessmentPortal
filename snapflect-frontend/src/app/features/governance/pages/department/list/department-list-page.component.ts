import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

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
    }
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Departments</h2>
          <p class="text-muted text-sm mt-1">Manage hierarchical structure and team grouping.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Department
        </button>
      </div>

      <!-- Data Table -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search departments...">
          </div>
          
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Business Unit</th>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && departments.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading departments...
                </td>
              </tr>
              <ng-container *ngIf="departments | globalSearch: searchTerm as filteredDepartments">
                <tr *ngIf="!loading && filteredDepartments.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                    No departments found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let dept of filteredDepartments" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 text-muted">{{ dept.relationships?.business_unit?.attributes?.business_unit_name || '-' }}</td>
                  <td class="px-6 py-4 font-medium text-brand-light">{{ dept.attributes.department_code }}</td>
                  <td class="px-6 py-4 text-main font-medium">{{ dept.attributes.department_name }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                          [ngClass]="dept.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ dept.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-muted hover:text-main transition-colors" (click)="openEditForm(dept)">Edit</button>
                    <button class="text-muted hover:text-red-400 transition-colors" (click)="deleteDept(dept.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Department' : 'Create Department'" 
                      description="Manage details for this organizational department."
                      (closeEvent)="closeForm()">
        <form [formGroup]="deptForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div>
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
            <label class="block text-sm font-medium text-muted mb-1">Department Code *</label>
            <input type="text" formControlName="department_code" 
                   class="input-field" 
                   placeholder="e.g. ENG">
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

  constructor() {
    this.deptForm = this.fb.group({
      organization_id: [null, Validators.required],
      business_unit_id: [null, Validators.required],
      department_code: ['', Validators.required],
      department_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchDepartments();
    this.fetchOrganizations();
    this.fetchBusinessUnits();
  }

  fetchOrganizations() {
    this.http.get<any>(`${environment.apiUrl}/governance/organizations?per_page=100`)
      .subscribe({
        next: (response) => {
          this.organizations = response.data ? response.data : response;
        }
      });
  }

  fetchBusinessUnits() {
    this.http.get<any>(`${environment.apiUrl}/governance/business-units?per_page=100`)
      .subscribe({
        next: (response) => {
          this.businessUnits = response.data ? response.data : response;
        }
      });
  }

  onOrgChange() {
    const orgId = this.deptForm.get('organization_id')?.value;
    if (orgId) {
      this.filteredBusinessUnits = this.businessUnits.filter(bu => bu.attributes.organization_id === orgId);
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