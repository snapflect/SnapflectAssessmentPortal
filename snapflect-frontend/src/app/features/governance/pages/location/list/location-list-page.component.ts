import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

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
}

@Component({
  selector: 'app-location-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Locations</h2>
          <p class="text-slate-400 text-sm mt-1">Manage physical or virtual locations for your organization.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Location
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-surface-darker/50" placeholder="Search locations...">
          </div>
          
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="text-xs text-slate-400 uppercase bg-surface-dark sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">City</th>
                <th scope="col" class="px-6 py-4 font-medium">Country</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && locations.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading locations...
                </td>
              </tr>
              <ng-container *ngIf="locations | globalSearch: searchTerm as filteredLocations">
                <tr *ngIf="!loading && filteredLocations.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                    No locations found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let loc of filteredLocations" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ loc.attributes.location_code }}</td>
                  <td class="px-6 py-4 text-white font-medium">{{ loc.attributes.location_name }}</td>
                  <td class="px-6 py-4">{{ loc.attributes.city || '-' }}</td>
                  <td class="px-6 py-4">{{ loc.attributes.country || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                          [ngClass]="loc.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ loc.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-slate-400 hover:text-white transition-colors" (click)="openEditForm(loc)">Edit</button>
                    <button class="text-slate-400 hover:text-red-400 transition-colors" (click)="deleteLoc(loc.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Location' : 'Create Location'" 
                      description="Manage details for this physical or virtual location."
                      (closeEvent)="closeForm()">
        <form [formGroup]="locForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Organization *</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null" disabled>Select an Organization</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes.organization_name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Location Code *</label>
            <input type="text" formControlName="location_code" class="input-field" placeholder="e.g. NY-HQ">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Location Name *</label>
            <input type="text" formControlName="location_name" class="input-field" placeholder="e.g. New York Headquarters">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">City</label>
              <input type="text" formControlName="city" class="input-field" placeholder="e.g. New York">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Country</label>
              <input type="text" formControlName="country" class="input-field" placeholder="e.g. USA">
            </div>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-white/10 mt-8">
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

  constructor() {
    this.locForm = this.fb.group({
      organization_id: [1, Validators.required],
      location_code: ['', Validators.required],
      location_name: ['', Validators.required],
      city: [''],
      country: ['']
    });
  }

  ngOnInit() {
    this.fetchOrganizations();
    this.fetchLocations();
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
