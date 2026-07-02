import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

interface Publication {
  id: number;
  uuid: string;
  attributes: {
    publication_code: string;
    title: string;
    status: string;
    start_date: string;
    end_date: string;
    max_attempts: number;
    is_proctored: boolean;
  };
  relationships?: {
    assessment?: { uuid: string; attributes: { title?: string; assessment_name?: string; assessment_code: string } };
  };
}

@Component({
  selector: 'app-publication-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideOverComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Publications</h2>
          <p class="text-slate-400 text-sm mt-1">Scheduled assessment events and delivery windows.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Publish Assessment
        </button>
      </div>

      <!-- Timeline / Table hybrid view -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div class="flex gap-2">
            <button *ngFor="let s of statusFilters" (click)="setFilter(s)" class="px-3 py-1.5 text-xs rounded-full font-medium transition-all"
                    [ngClass]="activeFilter === s ? 'bg-brand text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'">
              {{ s === '' ? 'All' : s }}
            </button>
          </div>
        </div>

        <div class="overflow-auto flex-1">

          <!-- Loading State -->
          <div *ngIf="loading && publications.length === 0" class="flex items-center justify-center py-20">
            <svg class="animate-spin h-8 w-8 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <!-- Empty State -->
          <div *ngIf="filtered.length === 0 && (!loading || publications.length > 0)" class="flex flex-col items-center justify-center py-20 text-slate-500">
            <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-lg">No publications found.</p>
          </div>

          <!-- Publications Table (Timeline style) -->
          <div *ngIf="filtered.length > 0" class="p-6 space-y-4 transition-opacity duration-300" [class.opacity-50]="loading" [class.pointer-events-none]="loading">
            <div *ngFor="let pub of filtered"
                 class="relative flex gap-6 items-stretch group">

              <!-- Timeline vertical line -->
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                     [ngClass]="getTimelineNodeClass(pub.attributes.status)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="w-px flex-1 bg-white/5 mt-2 mb-2 last:hidden"></div>
              </div>

              <!-- Publication Card -->
              <div class="flex-1 glass-card p-4 mb-4 hover:border-brand/20 transition-all">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded">{{ pub.attributes.publication_code }}</span>
                      <span *ngIf="pub.attributes.is_proctored" class="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">Proctored</span>
                    </div>
                    <h3 class="text-white font-semibold">{{ pub.attributes.title }}</h3>
                    <p class="text-slate-500 text-xs mt-1">
                      Assessment: <span class="text-slate-400">{{ pub.relationships?.assessment?.attributes?.assessment_name || 'N/A' }}</span>
                    </p>
                  </div>
                  <span class="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="getStatusClass(pub.attributes.status)">
                    {{ pub.attributes.status }}
                  </span>
                </div>

                <!-- Dates -->
                <div class="flex gap-6 text-xs text-slate-400 pt-3 border-t border-white/5">
                  <div>
                    <span class="text-slate-600 block uppercase tracking-wider text-[10px] mb-1">Start</span>
                    <span class="text-emerald-400 font-medium">{{ pub.attributes.start_date | date:'dd MMM yyyy, HH:mm' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-600 block uppercase tracking-wider text-[10px] mb-1">End</span>
                    <span class="text-red-400 font-medium">{{ pub.attributes.end_date | date:'dd MMM yyyy, HH:mm' }}</span>
                  </div>
                  <div class="ml-auto">
                    <span class="text-slate-600 block uppercase tracking-wider text-[10px] mb-1">Max Attempts</span>
                    <span class="text-white font-medium">{{ pub.attributes.max_attempts }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Publish SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      title="Publish Assessment" 
                      description="Create a new publication window for an approved assessment."
                      (closeEvent)="closeForm()">
        <form [formGroup]="pubForm" (ngSubmit)="submitForm()" class="space-y-5">

          <!-- Validation Errors Banner -->
          <div *ngIf="validationErrors.length > 0" class="p-4 rounded-md bg-red-500/10 border border-red-500/20">
            <h3 class="text-sm font-medium text-red-400 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Assessment Validation Failed
            </h3>
            <div class="mt-3 text-sm text-red-300/90">
              <ul class="list-disc pl-5 space-y-1">
                <li *ngFor="let err of validationErrors">{{ err }}</li>
              </ul>
            </div>
            <p class="text-xs text-red-400/70 mt-3 border-t border-red-500/10 pt-2">Please fix these errors in the Assessment Builder before publishing.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Assessment *</label>
            <select formControlName="assessment_uuid" class="input-field">
              <option value="">Select an Approved Assessment...</option>
              <option *ngFor="let a of availableAssessments" [value]="a.uuid">{{ a.attributes.assessment_name }} ({{ a.attributes.assessment_code }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Publication Code *</label>
            <input type="text" formControlName="publication_code" class="input-field" placeholder="e.g. PUB-Q3-DEV">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Event Title *</label>
            <input type="text" formControlName="title" class="input-field" placeholder="e.g. Q3 Developer Assessment Cohort">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
              <input type="datetime-local" formControlName="start_date" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">End Date *</label>
              <input type="datetime-local" formControlName="end_date" class="input-field">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Max Attempts *</label>
              <input type="number" formControlName="max_attempts" class="input-field" min="1">
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <input type="checkbox" formControlName="is_proctored" id="is_proctored" class="w-4 h-4 rounded text-brand">
            <label for="is_proctored" class="text-sm text-slate-300">Require Proctoring</label>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-white/10 mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="pubForm.invalid || submitting">
              {{ submitting ? 'Publishing...' : 'Publish' }}
            </button>
          </div>
        </form>
      </app-slide-over>
    </div>
  `
})
export class PublicationListPageComponent implements OnInit {
  publications: Publication[] = [];
  filtered: Publication[] = [];
  availableAssessments: any[] = [];
  loading = true;
  activeFilter = '';
  statusFilters = ['', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  isSlideOverOpen = false;
  submitting = false;
  validationErrors: string[] = [];
  pubForm: FormGroup;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  constructor() {
    this.pubForm = this.fb.group({
      assessment_uuid: ['', Validators.required],
      publication_code: ['', Validators.required],
      title: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      max_attempts: [1, [Validators.required, Validators.min(1)]],
      is_proctored: [false]
    });
  }

  ngOnInit() {
    this.fetchPublications();
    this.fetchAvailableAssessments();
  }

  fetchAvailableAssessments() {
    // Ideally we would filter for status=APPROVED here.
    this.http.get<any>(`${environment.apiUrl}/assessment/assessments?per_page=100`)
      .subscribe({
        next: (res) => {
          const allAss = res.data?.data || res.data || res;
          this.availableAssessments = allAss.filter((a: any) => a.attributes.current_state === 'APPROVED' || a.attributes.status === 'APPROVED');
        }
      });
  }

  fetchPublications() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/publications?include=assessment&per_page=100`)
      .subscribe({
        next: (res) => {
          this.publications = res.data?.data || res.data || res;
          this.applyFilter();
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  setFilter(status: string) {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter() {
    if (!this.activeFilter) {
      this.filtered = [...this.publications];
    } else {
      this.filtered = this.publications.filter(p => p.attributes.status === this.activeFilter);
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'ACTIVE': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'COMPLETED': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      'CANCELLED': 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400';
  }

  getTimelineNodeClass(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'border-blue-500/50 text-blue-400 bg-blue-500/10',
      'ACTIVE': 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
      'COMPLETED': 'border-slate-500/50 text-slate-400 bg-slate-500/10',
      'CANCELLED': 'border-red-500/50 text-red-400 bg-red-500/10',
    };
    return map[status] || 'border-slate-500/50 text-slate-400 bg-slate-500/10';
  }

  openCreateForm() {
    this.pubForm.reset({
      max_attempts: 1,
      is_proctored: false
    });
    this.validationErrors = [];
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.pubForm.dirty) {
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
    if (this.pubForm.invalid) {
      this.pubForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.validationErrors = [];
    
    // Convert datetime-local to standard ISO format string if necessary
    const payload = { ...this.pubForm.getRawValue() };

    this.http.post(`${environment.apiUrl}/assessment/publications`, payload)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.success('Assessment Published', 'The assessment has been successfully published.');
          this.closeForm(true);
          this.fetchPublications();
        },
        error: (err) => {
          this.submitting = false;
          if (err.error?.validation_errors) {
            this.validationErrors = err.error.validation_errors.map((e: any) => e.message);
          } else {
            const msg = err.error?.message || 'Failed to publish assessment.';
            this.toastService.error('Error', msg);
          }
        }
      });
  }
}
