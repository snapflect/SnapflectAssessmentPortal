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

interface Location {
  id: number;
  uuid: string;
  attributes: {
    organization_id: number;
    location_code: string;
    location_name: string;
    city: string | null;
    country: string | null;
    status: string;
  };
  relationships?: {
    users_count?: number;
  };
}

@Component({
  selector: 'app-location-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent, CountBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <app-page-header title="Locations" subtitle="Manage physical or virtual locations for your organization.">
        <button action *ngIf="userStore.hasAnyPermission(['Governance.Locations.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Location
        </button>
      </app-page-header>

      <app-data-table-shell
        [loading]="loading"
        [items]="locations | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search locations..."
        emptyMessage="No locations found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th class="text-center">Headcount</th>
            <th>City</th>
            <th>Country</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-loc>
          <tr>
            <td class="font-medium text-brand-light">{{ loc.attributes.location_code }}</td>
            <td class="text-main font-medium">{{ loc.attributes.location_name }}</td>
            <td class="text-center">
              <app-count-badge [count]="loc.relationships?.users_count || 0" label="Users"></app-count-badge>
            </td>
            <td>{{ loc.attributes.city || '-' }}</td>
            <td>{{ loc.attributes.country || '-' }}</td>
            <td>
              <app-status-badge [status]="loc.attributes.status"></app-status-badge>
            </td>
            <td class="text-right space-x-3">
              <button *ngIf="userStore.hasAnyPermission(['Governance.Locations.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(loc)">Edit</button>
              <button *ngIf="userStore.hasAnyPermission(['Governance.Locations.Manage'])" class="text-muted hover:text-red-400 transition-colors" (click)="deleteLoc(loc.uuid)">Delete</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Location' : 'Create Location'" 
                      description="Manage details for this physical or virtual location."
                      (closeEvent)="closeForm()">
        <form [formGroup]="locForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div *ngIf="isPlatformAdmin">
            <label class="block text-sm font-medium text-muted mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Location Code (Optional)</label>
            <input type="text" formControlName="location_code" class="input-field" placeholder="Leave blank to auto-generate">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Location Name *</label>
            <input type="text" formControlName="location_name" class="input-field" placeholder="e.g. New York Headquarters">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">City</label>
              <input type="text" formControlName="city" class="input-field" placeholder="e.g. New York">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Country</label>
              <input type="text" formControlName="country" class="input-field" placeholder="e.g. USA">
            </div>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="locForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Location</span>
            </button>
          </div>
        </form>
      </app-slide-over>

    </div>
  `
})
export class LocationListPageComponent implements OnInit {
  locations: Location[] = [];
  organizations: any[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  locForm: FormGroup;
  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  public userStore = inject(UserStore);

  isPlatformAdmin = false;

  constructor() {
    this.locForm = this.fb.group({
      organization_id: [1, Validators.required],
      location_code: [''],
      location_name: ['', Validators.required],
      city: [''],
      country: ['']
    });
  }

  ngOnInit() {
    this.fetchOrganizations();
    this.fetchLocations();
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

  fetchLocations() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/governance/locations`)
      .subscribe({
        next: (response) => {
          this.locations = response.data ? response.data : response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching locations', err);
          this.loading = false;
        }
      });
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.locForm.enable();
    const defaultOrg = this.organizations.length > 0 ? this.organizations[0].id : null;
    this.locForm.reset({ organization_id: defaultOrg });
    this.isSlideOverOpen = true;
  }

  openEditForm(loc: Location) {
    this.isEditing = true;
    this.currentEditUuid = loc.uuid;
    this.locForm.enable();
    this.locForm.patchValue({
      organization_id: loc.attributes.organization_id,
      location_code: loc.attributes.location_code,
      location_name: loc.attributes.location_name,
      city: loc.attributes.city,
      country: loc.attributes.country
    });
    // Intentionally restrict changing the structural code for existing locations
    this.locForm.get('location_code')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.locForm.dirty) {
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
    if (this.locForm.invalid) {
      this.locForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.locForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/governance/locations/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Location Updated', 'The location has been successfully updated.');
            this.closeForm(true);
            this.fetchLocations();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update location.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/governance/locations`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Location Created', 'The new location has been successfully created.');
            this.closeForm(true);
            this.fetchLocations();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create location.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteLoc(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Location',
      message: 'Are you sure you want to delete this location? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/governance/locations/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Location Deleted', 'The location was removed successfully.');
            this.fetchLocations();
          }
        });
    }
  }
}
