import { UserStore } from '../../../../../shared/stores/user.store';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';
import { AppPageHeaderComponent } from '../../../../../shared/components/app-page-header/app-page-header.component';
import { DataTableShellComponent } from '../../../../../shared/components/app-data-table-shell/app-data-table-shell.component';
import { StatusBadgeComponent } from '../../../../../shared/components/app-status-badge/app-status-badge.component';

interface Organization {
  id: number;
  uuid: string;
  attributes: {
    organization_code: string;
    organization_name: string;
    contact_email: string;
    country: string;
    status: string;
    current_subscription?: {
      status: string;
      plan_name: string;
    };
  };
}

interface SubscriptionPlan {
  id: number;
  plan_code: string;
  plan_name: string;
  price: number;
}

@Component({
  selector: 'app-organization-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe, AppPageHeaderComponent, DataTableShellComponent, StatusBadgeComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <!-- Page Header -->
      <app-page-header title="Organizations" subtitle="Manage tenants and their settings across the platform.">
        <button action *ngIf="userStore.hasAnyPermission(['Governance.Organizations.Manage'])" (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Provision Workspace
        </button>
      </app-page-header>

      <!-- Data Table -->
      <app-data-table-shell
        [loading]="loading"
        [items]="organizations | globalSearch: searchTerm"
        [(searchTerm)]="searchTerm"
        searchPlaceholder="Search organizations..."
        emptyMessage="No organizations found matching your search.">
        
        <ng-template #header>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Portal URL</th>
            <th>Plan</th>
            <th>Contact Email</th>
            <th class="text-right">Actions</th>
          </tr>
        </ng-template>

        <ng-template #row let-org>
          <tr>
            <td class="font-medium text-brand-light">{{ org.attributes.organization_code }}</td>
            <td class="text-main font-medium">{{ org.attributes.organization_name }}</td>
            <td>
              <div class="flex items-center space-x-2">
                <a [href]="getPortalUrl(org)" target="_blank" class="text-brand-light hover:text-brand transition-colors text-xs truncate max-w-[150px] inline-block" title="Open Portal">
                  {{ getPortalUrl(org) }}
                </a>
                <button (click)="copyPortalUrl(org)" class="text-muted hover:text-main transition-colors" title="Copy URL">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2" *ngIf="org.attributes.current_subscription">
                <span>{{ org.attributes.current_subscription.plan_name }}</span>
                <app-status-badge [status]="org.attributes.current_subscription.status"></app-status-badge>
              </div>
              <span *ngIf="!org.attributes.current_subscription" class="text-xs text-muted">No Plan</span>
            </td>
            <td>{{ org.attributes.contact_email || 'N/A' }}</td>
            <td class="text-right space-x-3">
              <button class="text-muted hover:text-brand transition-colors" (click)="openBillingView(org)">Billing</button>
              <button *ngIf="userStore.hasAnyPermission(['Governance.Organizations.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEditForm(org)">Edit</button>
              <button *ngIf="userStore.hasAnyPermission(['Governance.Organizations.Manage'])" class="text-muted hover:text-red-400 transition-colors" (click)="deleteOrg(org.uuid)">Delete</button>
            </td>
          </tr>
        </ng-template>
      </app-data-table-shell>

      <!-- SlideOver Form -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Organization' : 'Create Organization'" 
                      description="Fill in the details below to provision a new tenant workspace."
                      (closeEvent)="closeForm()">
        <form [formGroup]="orgForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Organization Code (Optional)</label>
            <input type="text" formControlName="organization_code" 
                   class="input-field" 
                   placeholder="e.g. ACME">
            <p *ngIf="orgForm.get('organization_code')?.invalid && orgForm.get('organization_code')?.touched" class="text-xs text-red-400 mt-1">
              Code is invalid.
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
          
          <div *ngIf="!isEditing">
            <label class="block text-sm font-medium text-muted mb-1">Subscription Plan</label>
            <select formControlName="plan_code" class="input-field">
              <option value="">Select a plan (defaults to 14-Day Free Demo)</option>
              <option *ngFor="let plan of subscriptionPlans" [value]="plan.plan_code">
                {{ plan.plan_name }} (₹{{ plan.price }})
              </option>
            </select>
          </div>

          <div *ngIf="!isEditing">
            <label class="block text-sm font-medium text-muted mb-1">Payment Reference (Optional)</label>
            <input type="text" formControlName="payment_reference" 
                   class="input-field" 
                   placeholder="e.g. PO-12345">
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

      <!-- Billing SlideOver -->
      <app-slide-over [isOpen]="isBillingSlideOverOpen" 
                      [title]="'Billing Details: ' + selectedOrgName" 
                      description="View subscription and invoice history for this organization."
                      (closeEvent)="closeBillingView()">
        <div class="space-y-6">
          <div *ngIf="loadingBilling" class="animate-pulse space-y-4">
            <div class="h-10 bg-slate-700/50 rounded w-full"></div>
            <div class="h-32 bg-slate-700/50 rounded w-full"></div>
          </div>
          
          <div *ngIf="!loadingBilling && selectedOrgBilling">
            <h3 class="text-lg font-medium text-main mb-3">Current Subscription</h3>
            <div *ngIf="selectedOrgBilling.subscription" class="p-4 bg-white/5 border border-white/10 rounded-lg mb-6">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-brand-light">{{ selectedOrgBilling.subscription.plan?.plan_name }}</span>
                <span class="px-2 py-0.5 rounded text-xs" [ngClass]="{'bg-green-500/10 text-green-400': selectedOrgBilling.subscription.status === 'ACTIVE', 'bg-blue-500/10 text-blue-400': selectedOrgBilling.subscription.status === 'TRIALING', 'bg-red-500/10 text-red-400': selectedOrgBilling.subscription.status === 'PAST_DUE'}">{{ selectedOrgBilling.subscription.status }}</span>
              </div>
              <p class="text-sm text-muted">Assessments Used: <span class="text-main">{{ selectedOrgBilling.subscription.assessments_used }} / {{ selectedOrgBilling.subscription.plan?.max_assessments || 'Unlimited' }}</span></p>
            </div>
            <div *ngIf="!selectedOrgBilling.subscription" class="text-muted italic mb-6">
              No active subscription.
            </div>

            <h3 class="text-lg font-medium text-main mb-3">Invoice History</h3>
            <div class="overflow-auto border border-white/10 rounded-lg">
              <table class="w-full text-left text-sm text-muted">
                <thead class="text-xs bg-white/5 uppercase">
                  <tr>
                    <th class="px-4 py-3 font-medium">Invoice #</th>
                    <th class="px-4 py-3 font-medium">Date</th>
                    <th class="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="selectedOrgBilling.invoices.length === 0">
                    <td colspan="3" class="px-4 py-6 text-center italic">No invoices found.</td>
                  </tr>
                  <tr *ngFor="let invoice of selectedOrgBilling.invoices" class="border-t border-white/5">
                    <td class="px-4 py-3">{{ invoice.invoice_number }}</td>
                    <td class="px-4 py-3">{{ invoice.billing_period_start | date:'shortDate' }}</td>
                    <td class="px-4 py-3">{{ invoice.status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </app-slide-over>
    </div>
  `
})
export class OrganizationListPageComponent implements OnInit {
  organizations: Organization[] = [];
  subscriptionPlans: SubscriptionPlan[] = [];
  loading = true;
  searchTerm = '';
  
  isSlideOverOpen = false;
  isBillingSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  loadingBilling = false;
  selectedOrgBilling: any = null;
  selectedOrgName = '';
  
  orgForm: FormGroup;
  userStore = inject(UserStore);

  
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);

  constructor() {
    this.orgForm = this.fb.group({
      organization_code: [''],
      organization_name: ['', Validators.required],
      contact_email: ['', Validators.email],
      plan_code: [''],
      payment_reference: ['']
    });
  }

  ngOnInit() {
    this.fetchOrganizations();
    this.fetchSubscriptionPlans();
  }

  fetchSubscriptionPlans() {
    this.http.get<any>(`${environment.apiUrl}/billing/plans`)
      .subscribe({
        next: (response) => {
          this.subscriptionPlans = response.data ? response.data : response;
        },
        error: (err) => {
          console.error('Error fetching subscription plans', err);
        }
      });
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
    this.router.navigate(['/governance/organizations/create']);
  }

  openEditForm(org: Organization) {
    this.router.navigate(['/governance/organizations', org.uuid, 'edit']);
  }

  openBillingView(org: Organization) {
    this.selectedOrgName = org.attributes.organization_name;
    this.isBillingSlideOverOpen = true;
    this.loadingBilling = true;
    this.selectedOrgBilling = null;

    this.http.get<any>(`${environment.apiUrl}/governance/organizations/${org.uuid}/billing`)
      .subscribe({
        next: (res) => {
          this.selectedOrgBilling = res.data;
          this.loadingBilling = false;
        },
        error: (err) => {
          this.toastService.error('Error', 'Failed to load billing details.');
          this.loadingBilling = false;
        }
      });
  }

  closeBillingView() {
    this.isBillingSlideOverOpen = false;
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

  getPortalUrl(org: Organization): string {
    const code = org.attributes.organization_code ? org.attributes.organization_code.toLowerCase() : org.uuid.toLowerCase();
    const port = window.location.port ? ':' + window.location.port : '';
    // Use the current hostname but replace the tenant part with the organization's code
    // E.g. if current is portal.snapflect.localhost, replace 'portal' with org code
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length > 1) {
        hostParts[0] = code;
    } else {
        hostParts.unshift(code);
    }
    return `${window.location.protocol}//${hostParts.join('.')}${port}`;
  }

  copyPortalUrl(org: Organization) {
    const url = this.getPortalUrl(org);
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Copied', 'Portal URL copied to clipboard.');
    }).catch(() => {
      this.toastService.error('Error', 'Failed to copy URL.');
    });
  }
}