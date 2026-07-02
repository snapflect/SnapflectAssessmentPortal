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

interface QuestionBank {
  id: number;
  uuid: string;
  attributes: {
    bank_code: string;
    bank_name: string;
    description: string;
    status: string;
  };
  relationships?: {
    questions_count?: number;
  };
}

@Component({
  selector: 'app-question-bank-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Question Banks</h2>
          <p class="text-muted text-sm mt-1">Organize and manage your assessment questions into distinct banks.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Bank
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg">
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-page/50" placeholder="Search question banks...">
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Questions</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && banks.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading question banks...
                </td>
              </tr>
              <ng-container *ngIf="banks | globalSearch: searchTerm as filteredBanks">
                <tr *ngIf="!loading && filteredBanks.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    No question banks found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let bank of filteredBanks" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ bank.attributes.bank_code }}</td>
                  <td class="px-6 py-4 text-main font-medium">
                    {{ getBankDisplayName(bank) }}
                    <p class="text-xs text-slate-500 mt-1 font-normal">{{ bank.attributes.description }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs">
                      {{ bank.relationships?.questions_count || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                          [ngClass]="bank.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                      {{ bank.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-muted hover:text-main transition-colors" (click)="openEditForm(bank)">Edit</button>
                    <button class="text-muted hover:text-red-400 transition-colors" (click)="deleteBank(bank.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Question Bank' : 'Create Question Bank'" 
                      description="Manage the configuration for this question bank."
                      (closeEvent)="closeForm()">
        <form [formGroup]="bankForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div *ngIf="isPlatformAdmin">
            <label class="block text-sm font-medium text-muted mb-1">Organization</label>
            <select formControlName="organization_id" class="input-field">
              <option [ngValue]="null">Global (System-Wide)</option>
              <option *ngFor="let org of organizations" [ngValue]="org.id">{{ org.attributes?.organization_name || org.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Bank Code *</label>
            <input type="text" formControlName="bank_code" class="input-field" placeholder="e.g. IT-SEC-01">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Bank Name *</label>
            <input type="text" formControlName="bank_name" class="input-field" placeholder="e.g. Information Security">
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-24 resize-none" placeholder="What kind of questions are here?"></textarea>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="bankForm.invalid || submitting">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Bank</span>
            </button>
          </div>
        </form>
      </app-slide-over>
    </div>
  `
})
export class QuestionBankListPageComponent implements OnInit {
  banks: QuestionBank[] = [];
  loading = true;
  searchTerm = '';
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  bankForm: FormGroup;
  isPlatformAdmin = false;
  organizations: any[] = [];
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private userStore = inject(UserStore);

  constructor() {
    this.bankForm = this.fb.group({
      organization_id: [null],
      bank_code: ['', Validators.required],
      bank_name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN']);
    this.fetchBanks();
    if (this.isPlatformAdmin) {
      this.fetchOrganizations();
    }
  }

  fetchOrganizations() {
    this.http.get<any>(`${environment.apiUrl}/governance/organizations?per_page=100`)
      .subscribe({
        next: (response) => {
          this.organizations = response.data ? response.data : response;
        },
        error: (err) => console.error('Error fetching organizations', err)
      });
  }

  fetchBanks() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/question-banks`)
      .subscribe({
        next: (response) => {
          const payload = response.data ? response.data : response;
          this.banks = Array.isArray(payload) ? payload : (payload.data || []);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching question banks', err);
          this.loading = false;
        }
      });
  }

  getBankDisplayName(bank: any): string {
    if (!bank || !bank.attributes) return 'N/A';
    if (!this.isPlatformAdmin) {
      return bank.attributes.bank_name || 'N/A';
    }
    
    // Platform Admin gets extra context
    if (bank.attributes.is_system_bank) {
      return `${bank.attributes.bank_name} (Global System Bank)`;
    }
    const orgName = bank.relationships?.organization?.attributes?.organization_name;
    if (orgName) {
      return `${bank.attributes.bank_name} (Org: ${orgName})`;
    }
    
    return bank.attributes.bank_name || 'N/A';
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.bankForm.enable();
    this.bankForm.reset();
    this.isSlideOverOpen = true;
  }

  openEditForm(bank: QuestionBank) {
    this.isEditing = true;
    this.currentEditUuid = bank.uuid;
    this.bankForm.enable();
    // Assuming backend returns organization relationships, but if not we leave it untouched or null
    this.bankForm.patchValue({
      organization_id: (bank as any).attributes?.organization_id || null,
      bank_code: bank.attributes.bank_code,
      bank_name: bank.attributes.bank_name,
      description: bank.attributes.description
    });
    // Intentionally restrict changing the structural code for existing question banks
    this.bankForm.get('bank_code')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.bankForm.dirty) {
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
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.bankForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/assessment/question-banks/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Question Bank Updated', 'The bank has been successfully updated.');
            this.closeForm(true);
            this.fetchBanks();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update question bank.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/assessment/question-banks`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Question Bank Created', 'The new question bank has been successfully created.');
            this.closeForm(true);
            this.fetchBanks();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create question bank.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteBank(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Question Bank',
      message: 'Are you sure you want to delete this question bank? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/assessment/question-banks/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Question Bank Deleted', 'The question bank was removed successfully.');
            this.fetchBanks();
          }
        });
    }
  }
}