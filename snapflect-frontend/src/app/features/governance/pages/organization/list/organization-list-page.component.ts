import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface Organization {
  id: number;
  uuid: string;
  attributes: {
    organization_code: string;
    organization_name: string;
    contact_email: string;
    country: string;
    status: string;
  };
}

@Component({
  selector: 'app-organization-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Organizations</h2>
          <p class="text-muted text-sm mt-1">Manage tenants and their settings across the platform.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Organization
        </button>
      </div>

      <!-- Data Table -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search organizations...">
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Contact Email</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && organizations.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading organizations...
                </td>
              </tr>
              <ng-container *ngIf="organizations | globalSearch: searchTerm as filteredOrgs">
                <tr *ngIf="!loading && filteredOrgs.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                    No organizations found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let org of filteredOrgs" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ org.attributes.organization_code }}</td>
                  <td class="px-6 py-4 text-main font-medium">{{ org.attributes.organization_name }}</td>
                  <td class="px-6 py-4">{{ org.attributes.contact_email || 'N/A' }}</td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-muted hover:text-main transition-colors" (click)="openEditForm(org)">Edit</button>
                    <button class="text-muted hover:text-red-400 transition-colors" (click)="deleteOrg(org.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Organization' : 'Create Organization'" 
                      description="Fill in the details below to provision a new tenant workspace."
                      (closeEvent)="closeForm()">
        <form [formGroup]="orgForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Organization Code *</label>
            <input type="text" formControlName="organization_code" 
                   class="input-field" 
                   placeholder="e.g. ACME">
            <p *ngIf="orgForm.get('organization_code')?.invalid && orgForm.get('organization_code')?.touched" class="text-xs text-red-400 mt-1">
              Code is required.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Organization Name *</label>
            <input type="text" formControlName="organization_name" 
                   class="input-field" 
                   placeholder="e.g. Acme Corporation">
            <p *ngIf="orgForm.get('organization_name')?.invalid && orgForm.get('organization_name')?.touched" class="text-xs text-red-400 mt-1">
              Name is required.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Contact Email</label>
            <input type="email" formControlName="contact_email" 
                   class="input-field" 
                   placeholder="admin@acme.com">
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="orgForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Organization</span>
            </button>
          </div>
        </form>
      </app-slide-over>

    </div>
  `
})
export class OrganizationListPageComponent implements OnInit {
  organizations: Organization[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  orgForm: FormGroup;
  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  constructor() {
    this.orgForm = this.fb.group({
      organization_code: ['', Validators.required],
      organization_name: ['', Validators.required],
      contact_email: ['', Validators.email]
    });
  }

  ngOnInit() {
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/governance/organizations`)
      .subscribe({
        next: (response) => {
          this.organizations = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching organizations', err);
          this.loading = false;
        }
      });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.orgForm.enable();
    this.orgForm.reset();
    this.isSlideOverOpen = true;
  }

  openEditForm(org: Organization) {
    this.isEditing = true;
    this.currentEditUuid = org.uuid;
    this.orgForm.enable();
    this.orgForm.patchValue({
      organization_code: org.attributes.organization_code,
      organization_name: org.attributes.organization_name,
      contact_email: org.attributes.contact_email
    });
    // Intentionally restrict changing the organization code for existing tenants
    this.orgForm.get('organization_code')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.orgForm.dirty) {
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
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.orgForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/governance/organizations/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Organization Updated', 'The organization has been successfully updated.');
            this.closeForm(true);
            this.fetchOrganizations();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update organization.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/governance/organizations`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Organization Created', 'The new organization has been successfully created.');
            this.closeForm(true);
            this.fetchOrganizations();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create organization.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteOrg(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Organization',
      message: 'Are you sure you want to delete this organization? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/governance/organizations/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Organization Deleted', 'The organization was removed successfully.');
            this.fetchOrganizations();
          }
        });
    }
  }
}