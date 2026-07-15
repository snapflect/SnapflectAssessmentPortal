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

interface BusinessUnit {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number;
    business_unit_code: string;
    business_unit_name: string;
    status: string;
  };
  relationships?: {
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

@Component({
  selector: 'app-business-unit-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent, CountBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Business Units" subtitle="Manage broad organizational groups and cost centers.">
        <button action *ngIf="userStore.hasAnyPermission(['Governance.BusinessUnits.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Business Unit
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="businessUnits | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search business units..."
        emptyMessage="No business units found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th class="text-center">Headcount</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-bu>
          <tr>
            <td class="font-medium text-brand-light">{{ bu.attributes.business_unit_code }}</td>
            <td class="text-main font-medium">{{ bu.attributes.business_unit_name }}</td>
            <td class="text-center">
              <app-count-badge [count]="bu.relationships?.users_count || 0" label="Users"></app-count-badge>
            </td>
            <td>
              <app-status-badge [status]="bu.attributes.status"></app-status-badge>
            </td>
            <td class="text-right space-x-3">
              <button *ngIf="userStore.hasAnyPermission(['Governance.BusinessUnits.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(bu)">Edit</button>
              <button *ngIf="userStore.hasAnyPermission(['Governance.BusinessUnits.Manage'])" class="text-muted hover:text-red-400 transition-colors" (click)="deleteBU(bu.uuid)">Delete</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Business Unit' : 'Create Business Unit'" 
                      description="Manage details for this business unit."
                      (closeEvent)="closeForm()">
        <form [formGroup]="buForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div *ngIf="isPlatformAdmin">
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-main mb-1">Code (Optional)</label>
            <input type="text" formControlName="business_unit_code" class="input-field" placeholder="Leave blank to auto-generate">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Business Unit Name *</label>
            <input type="text" formControlName="business_unit_name" class="input-field" placeholder="e.g. Global Sales Group">
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="buForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Business Unit</span>
            </button>
          </div>
        </form>
      </app-slide-over>

    </div>
  `
})
export class BusinessUnitListPageComponent implements OnInit {
  businessUnits: BusinessUnit[] = [];
  organizations: Organization[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  buForm: FormGroup;
  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public userStore = inject(UserStore);

  isPlatformAdmin = false;

  constructor() {
    this.buForm = this.fb.group({
      organization_id: [null, Validators.required],
      business_unit_code: [''],
      business_unit_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchBUs();
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

  fetchBUs() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/governance/business-units`)
      .subscribe({
        next: (response) => {
          this.businessUnits = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching business units', err);
          this.loading = false;
        }
      });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.buForm.enable();
    this.buForm.reset({ organization_id: this.organizations.length > 0 ? this.organizations[0].id : null });
    this.isSlideOverOpen = true;
  }

  openEditForm(bu: BusinessUnit) {
    this.isEditing = true;
    this.currentEditUuid = bu.uuid;
    this.buForm.enable();
    this.buForm.patchValue({
      organization_id: bu.attributes.organization_id,
      business_unit_code: bu.attributes.business_unit_code,
      business_unit_name: bu.attributes.business_unit_name
    });
    // Intentionally restrict changing organization and code for existing business units
    this.buForm.get('organization_id')?.disable();
    this.buForm.get('business_unit_code')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.buForm.dirty) {
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
    if (this.buForm.invalid) {
      this.buForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    // Use getRawValue() to include disabled fields in the payload if needed, 
    // although the backend will ignore org_id and code on PUT anyway.
    const payload = this.buForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/governance/business-units/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Business Unit Updated', 'The business unit has been successfully updated.');
            this.closeForm(true);
            this.fetchBUs();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update business unit.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/governance/business-units`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Business Unit Created', 'The new business unit has been successfully created.');
            this.closeForm(true);
            this.fetchBUs();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create business unit.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteBU(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Business Unit',
      message: 'Are you sure you want to delete this business unit? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/governance/business-units/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Business Unit Deleted', 'The business unit was removed successfully.');
            this.fetchBUs();
          }
        });
    }
  }
}
