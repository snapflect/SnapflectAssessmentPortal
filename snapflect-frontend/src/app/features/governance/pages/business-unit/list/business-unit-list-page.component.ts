import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface BusinessUnit {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number;
    business_unit_code: string;
    business_unit_name: string;
    status: string;
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Business Units</h2>
          <p class="text-muted text-sm mt-1">Manage broad organizational groups and cost centers.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Business Unit
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search business units...">
          </div>
          
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && businessUnits.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading business units...
                </td>
              </tr>
              <ng-container *ngIf="businessUnits | globalSearch: searchTerm as filteredBUs">
                <tr *ngIf="!loading && filteredBUs.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                    No business units found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let bu of filteredBUs" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ bu.attributes.business_unit_code }}</td>
                  <td class="px-6 py-4 text-main font-medium">{{ bu.attributes.business_unit_name }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                          [ngClass]="bu.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ bu.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-muted hover:text-main transition-colors" (click)="openEditForm(bu)">Edit</button>
                    <button class="text-muted hover:text-red-400 transition-colors" (click)="deleteBU(bu.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Business Unit' : 'Create Business Unit'" 
                      description="Manage details for this business unit."
                      (closeEvent)="closeForm()">
        <form [formGroup]="buForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Business Unit Code *</label>
            <input type="text" formControlName="business_unit_code" class="input-field" placeholder="e.g. SALES">
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

  constructor() {
    this.buForm = this.fb.group({
      organization_id: [null, Validators.required],
      business_unit_code: ['', Validators.required],
      business_unit_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchBUs();
    this.fetchOrganizations();
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
