import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../../../../../shared/stores/user.store';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { PublishWizardComponent } from '../../../components/publish-wizard/publish-wizard.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

interface Assessment {
  id: number;
  uuid: string;
  attributes: {
    assessment_code: string;
    assessment_name: string;
    description: string;
    current_state: string;
    estimated_duration_minutes: number;
    total_marks: number;
    pass_percentage: number;
    is_randomized: boolean;
    created_by?: number;
  };
  relationships?: {
    type?: { uuid: string; attributes: { type_name: string } };
    category?: { uuid: string; attributes: { category_name: string } };
    versions_count?: number;
  };
}

interface AssessmentType { uuid: string; attributes: { type_name: string; type_code: string; status: string; } }
interface AssessmentCategory { uuid: string; attributes: { category_name: string; category_code: string; status: string; } }

@Component({
  selector: 'app-assessment-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SlideOverComponent, PublishWizardComponent],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Assessment Catalog</h2>
          <p class="text-muted text-sm mt-1">Create and manage all assessments, blueprints and publications.</p>
        </div>
        <button *ngIf="(userStore.hasAnyPermission(['Assessment.Catalog.Manage'])) && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])"  (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Assessment
        </button>
      </div>

      <!-- Toolbar: Search + Status Filter -->
      <div class="flex gap-4 mb-6">
        <div class="relative flex-1">
          <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input type="text" [(ngModel)]="searchTerm" (input)="filterAssessments()" class="input-field pl-10 py-2" placeholder="Search assessments...">
        </div>
        <div class="flex gap-2">
          <button *ngFor="let s of statuses" (click)="setStatusFilter(s)" class="px-3 py-2 text-xs rounded-full font-medium transition-all"
                  [ngClass]="activeStatus === s ? 'bg-brand text-main' : 'hover:brightness-110 text-muted hover:bg-white/10'">
            {{ s === '' ? 'All' : s }}
          </button>
        </div>
      </div>

      <!-- Card Grid -->
      <div *ngIf="loading && assessments.length === 0" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="!loading && filteredAssessments.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-500">
        <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-lg">No assessments found.</p>
        <p class="text-sm mt-1">Create your first assessment to get started.</p>
      </div>

      <div *ngIf="assessments.length > 0" class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 auto-rows-max gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 content-start transition-opacity duration-300" [class.opacity-50]="loading" [class.pointer-events-none]="loading">
        <div *ngFor="let a of filteredAssessments" class="relative group p-6 rounded-2xl bg-white/[0.02] border border-border-light hover:border-brand/40 hover:bg-white/[0.04] transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-brand/10 hover:-translate-y-1 h-full min-h-[260px]">
          
          <!-- Subtle background glow on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <!-- Header -->
          <div class="flex items-start justify-between mb-5 relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center text-brand-light shadow-inner">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div>
                <span class="px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold rounded-md hover:brightness-110 text-muted border border-border-light inline-block">
                  {{ a.attributes.assessment_code }}
                </span>
              </div>
            </div>
            <span class="px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm" [ngClass]="getStatusClass(a.attributes.current_state)">
              {{ a.attributes.current_state.replace('_', ' ') }}
            </span>
          </div>

          <!-- Body -->
          <div class="relative z-10 flex-1 mb-5">
            <h3 class="text-xl font-bold text-main mb-2 group-hover:text-brand-light transition-colors duration-300 leading-tight">
              {{ a.attributes.assessment_name }}
            </h3>
            <p class="text-muted text-sm line-clamp-2 leading-relaxed">
              {{ a.attributes.description || 'No description provided.' }}
            </p>
          </div>

          <!-- Type and Category Tags -->
          <div class="flex flex-wrap gap-2 mb-6 relative z-10">
            <span *ngIf="a.relationships?.category" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              {{ a.relationships?.category?.attributes?.category_name }}
            </span>
            <span *ngIf="a.relationships?.type" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              {{ a.relationships?.type?.attributes?.type_name }}
            </span>
          </div>

          <!-- Footer Metadata -->
          <div class="grid grid-cols-2 gap-4 text-sm text-muted mb-6 pt-5 border-t border-white/5 relative z-10">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Duration</span>
              <span class="flex items-center gap-1.5 text-main font-medium text-sm">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ a.attributes.estimated_duration_minutes }} min
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Pass Mark</span>
              <span class="flex items-center gap-1.5 text-main font-medium text-sm">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ a.attributes.pass_percentage }}%
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 relative z-10 mt-auto pt-4">
            <button *ngIf="(userStore.hasAnyPermission(['Assessment.Catalog.Manage'])) && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])"  (click)="openEditForm(a)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl hover:brightness-110 hover:bg-white/10 text-main font-medium text-xs transition-all duration-200 shadow-sm border border-white/5 hover:border-border-light flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit
            </button>
            <button *ngIf="(a.attributes.current_state === 'DRAFT' || a.attributes.current_state === 'IN_REVIEW') && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="goToDesigner(a)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium text-xs transition-all duration-200 shadow-sm border border-purple-500/20 hover:border-purple-500/40 flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
              Designer
            </button>
            <button *ngIf="(a.attributes.current_state === 'DRAFT') && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="submitReview(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium text-xs border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Submit
            </button>
            <button *ngIf="(a.attributes.current_state === 'IN_REVIEW' && canApprove(a)) && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="approveAssessment(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"></path></svg>
              Approve
            </button>
            <button *ngIf="(a.attributes.current_state === 'APPROVED' && canApprove(a)) && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="openPublishWizard(a)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium text-xs border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Publish
            </button>
            <button *ngIf="(a.attributes.current_state === 'APPROVED' || a.attributes.current_state === 'PUBLISHED') && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="cloneAssessment(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium text-xs border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Clone
            </button>
            <button *ngIf="(a.attributes.current_state === 'IN_REVIEW' && canApprove(a)) && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="rejectAssessment(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs border border-red-500/20 hover:border-red-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              Reject
            </button>
            <button *ngIf="(a.attributes.current_state === 'PUBLISHED') && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="archiveAssessment(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs border border-red-500/20 hover:border-red-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              Archive
            </button>
            <button *ngIf="(a.attributes.current_state !== 'PUBLISHED') && userStore.hasAnyPermission(['Assessment.Catalog.Manage'])" (click)="deleteAssessment(a.uuid)" class="flex-1 min-w-[100px] py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs border border-red-500/20 hover:border-red-500/40 transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Create / Edit SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen"
                      [title]="isEditing ? 'Edit Assessment' : 'Create Assessment'"
                      description="Configure assessment metadata and settings."
                      width="w-screen max-w-xl"
                      (closeEvent)="closeForm()">
        <form [formGroup]="assessmentForm" (ngSubmit)="submitForm()" class="space-y-5">

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Code *</label>
              <input type="text" formControlName="assessment_code" class="input-field" placeholder="e.g. ASSESS-001">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Name *</label>
              <input type="text" formControlName="assessment_name" class="input-field" placeholder="Assessment name">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-20 resize-none" placeholder="Brief description of this assessment..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Type *</label>
              <select formControlName="assessment_type_uuid" class="input-field">
                <option value="">Select type...</option>
                <option *ngFor="let t of types" [value]="t.uuid">{{ t.attributes.type_name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Category *</label>
              <select formControlName="assessment_category_uuid" class="input-field">
                <option value="">Select category...</option>
                <option *ngFor="let c of categories" [value]="c.uuid">{{ c.attributes.category_name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Duration (min) *</label>
              <input type="number" formControlName="estimated_duration_minutes" class="input-field" min="1">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Total Marks *</label>
              <input type="number" formControlName="total_marks" class="input-field" min="1">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Pass % *</label>
              <input type="number" formControlName="pass_percentage" class="input-field" min="1" max="100">
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 hover:brightness-110 rounded-lg border border-border-light">
            <input type="checkbox" formControlName="is_randomized" id="is_randomized" class="w-4 h-4 rounded text-brand">
            <label for="is_randomized" class="text-sm text-muted">Randomize question order for each candidate</label>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light mt-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="assessmentForm.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Save Assessment' }}
            </button>
          </div>
        </form>
      </app-slide-over>

      <!-- Publish Wizard Modal -->
      <app-publish-wizard 
        *ngIf="showPublishWizard"
        [assessment]="selectedPublishAssessment"
        (closed)="showPublishWizard = false; selectedPublishAssessment = null"
        (published)="submitPublish($event)">
      </app-publish-wizard>
    </div>
  `
})
export class AssessmentListPageComponent implements OnInit {
  assessments: Assessment[] = [];
  filteredAssessments: Assessment[] = [];
  types: AssessmentType[] = [];
  categories: AssessmentCategory[] = [];
  loading = true;
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  searchTerm = '';
  activeStatus = '';
  statuses = ['', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

  showPublishWizard = false;
  selectedPublishAssessment: Assessment | null = null;

  assessmentForm: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  public userStore = inject(UserStore);

  constructor() {
    this.assessmentForm = this.fb.group({
      assessment_code: ['', Validators.required],
      assessment_name: ['', Validators.required],
      description: [''],
      assessment_type_uuid: ['', Validators.required],
      assessment_category_uuid: ['', Validators.required],
      estimated_duration_minutes: [60, [Validators.required, Validators.min(1)]],
      total_marks: [100, [Validators.required, Validators.min(1)]],
      pass_percentage: [50, [Validators.required, Validators.min(1), Validators.max(100)]],
      is_randomized: [false]
    });
  }

  ngOnInit() {
    this.fetchAssessments();
    this.fetchTypes();
    this.fetchCategories();
  }

  fetchAssessments() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/assessments?include=type,category&per_page=100`)
      .subscribe({
        next: (res) => {
          this.assessments = res.data || res;
          this.filterAssessments();
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  fetchTypes() {
    this.http.get<any>(`${environment.apiUrl}/assessment/types?per_page=100`)
      .subscribe({ next: (res) => {
        const data = res.data || res;
        this.types = data.filter((t: AssessmentType) => t.attributes.status === 'ACTIVE');
      }});
  }

  fetchCategories() {
    this.http.get<any>(`${environment.apiUrl}/assessment/categories?per_page=100`)
      .subscribe({ next: (res) => {
        const data = res.data || res;
        this.categories = data.filter((c: AssessmentCategory) => c.attributes.status === 'ACTIVE');
      }});
  }

  setStatusFilter(status: string) {
    this.activeStatus = status;
    this.filterAssessments();
  }

  filterAssessments() {
    let filtered = [...this.assessments];
    if (this.activeStatus) {
      filtered = filtered.filter(a => a.attributes.current_state === this.activeStatus);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.attributes.assessment_name.toLowerCase().includes(term) ||
        a.attributes.assessment_code.toLowerCase().includes(term)
      );
    }
    this.filteredAssessments = filtered;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'DRAFT': 'bg-slate-500/10 text-muted border border-slate-500/20',
      'IN_REVIEW': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'APPROVED': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'PUBLISHED': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'ARCHIVED': 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-muted';
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.assessmentForm.enable();
    this.assessmentForm.reset({ estimated_duration_minutes: 60, total_marks: 100, pass_percentage: 50, is_randomized: false });
    this.isSlideOverOpen = true;
  }

  openEditForm(a: Assessment) {
    this.isEditing = true;
    this.currentEditUuid = a.uuid;
    this.assessmentForm.patchValue({
      assessment_code: a.attributes.assessment_code,
      assessment_name: a.attributes.assessment_name,
      description: a.attributes.description,
      estimated_duration_minutes: a.attributes.estimated_duration_minutes,
      total_marks: a.attributes.total_marks,
      pass_percentage: a.attributes.pass_percentage,
      is_randomized: a.attributes.is_randomized,
      assessment_type_uuid: a.relationships?.type?.uuid || '',
      assessment_category_uuid: a.relationships?.category?.uuid || ''
    });
    // Intentionally restrict changing the structural code for existing assessments
    this.assessmentForm.get('assessment_code')?.disable();
    this.isSlideOverOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.assessmentForm.dirty) {
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
    if (this.assessmentForm.invalid) {
      this.assessmentForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = this.assessmentForm.getRawValue();
    const req = this.isEditing && this.currentEditUuid
      ? this.http.put(`${environment.apiUrl}/assessment/assessments/${this.currentEditUuid}`, payload)
      : this.http.post(`${environment.apiUrl}/assessment/assessments`, payload);

    req.subscribe({
      next: () => { 
        this.submitting = false; 
        this.toastService.success('Assessment Saved', 'The assessment has been successfully saved.');
        this.closeForm(true); 
        this.fetchAssessments(); 
      },
      error: (err) => { 
        this.submitting = false; 
        const msg = err.error?.message || 'Failed to save assessment.';
        this.toastService.error('Error', msg);
      }
    });
  }

  submitReview(uuid: string) {
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/submit-review`, {})
      .subscribe({ 
        next: () => {
          this.toastService.success('Submitted for Review', 'The assessment has been submitted for review.');
          this.fetchAssessments();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to submit review.';
          this.toastService.error('Error', msg);
        }
      });
  }

  rejectAssessment(uuid: string) {
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/reject`, {})
      .subscribe({ 
        next: () => {
          this.toastService.success('Assessment Rejected', 'The assessment has been returned to draft.');
          this.fetchAssessments();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to reject assessment.';
          this.toastService.error('Error', msg);
        }
      });
  }

  approveAssessment(uuid: string) {
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/approve`, {})
      .subscribe({ 
        next: () => {
          this.toastService.success('Assessment Approved', 'The assessment is now ready to be published.');
          this.fetchAssessments();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to approve assessment.';
          this.toastService.error('Error', msg);
        }
      });
  }

  openPublishWizard(assessment: Assessment) {
    this.selectedPublishAssessment = assessment;
    this.showPublishWizard = true;
  }

  submitPublish(schedulingData: any) {
    if (!this.selectedPublishAssessment) return;
    const uuid = this.selectedPublishAssessment.uuid;
    
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/publish`, { scheduling: schedulingData })
      .subscribe({ 
        next: () => {
          this.toastService.success('Assessment Published', 'The assessment is now live.');
          this.showPublishWizard = false;
          this.selectedPublishAssessment = null;
          this.fetchAssessments();
        },
        error: (err) => {
          if (err.status === 422 && err.error?.detail && typeof err.error.detail === 'object') {
             const errors = (Object.values(err.error.detail) as string[][]).reduce((acc, val) => acc.concat(val), []);
             this.toastService.error('Validation Error', errors.join(' '));
          } else {
             const msg = err.error?.message || (typeof err.error?.detail === 'string' ? err.error.detail : 'Failed to publish assessment.');
             this.toastService.error('Error', msg);
          }
          this.showPublishWizard = false;
          this.selectedPublishAssessment = null;
        }
      });
  }

  archiveAssessment(uuid: string) {
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/archive`, {})
      .subscribe({ 
        next: () => {
          this.toastService.success('Assessment Archived', 'The assessment has been archived.');
          this.fetchAssessments();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to archive assessment.';
          this.toastService.error('Error', msg);
        }
      });
  }

  cloneAssessment(uuid: string) {
    const payload = {
      assessment_uuid: uuid,
      change_summary: 'Cloned from existing assessment.'
    };
    this.http.post(`${environment.apiUrl}/assessment/assessments/${uuid}/clone`, payload)
      .subscribe({ 
        next: () => {
          this.toastService.success('Assessment Cloned', 'A new draft copy has been created.');
          this.fetchAssessments();
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to clone assessment.';
          this.toastService.error('Error', msg);
        }
      });
  }

  goToDesigner(assessment: Assessment) {
    this.router.navigate(['/authoring/blueprints'], { queryParams: { assessment_uuid: assessment.uuid } });
  }

  deleteAssessment(uuid: string) {
    this.confirmService.confirm({
      title: 'Delete Assessment',
      message: 'Are you sure you want to delete this draft assessment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).then((confirmed) => {
      if (confirmed) {
        this.http.delete(`${environment.apiUrl}/assessment/assessments/${uuid}`)
          .subscribe({
            next: () => {
              this.toastService.success('Assessment Deleted', 'The draft assessment was permanently removed.');
              this.fetchAssessments();
            },
            error: (err) => {
              const msg = err.error?.message || 'Failed to delete assessment.';
              this.toastService.error('Error', msg);
            }
          });
      }
    });
  }

  canApprove(assessment: Assessment): boolean {
    const user = this.userStore.profile();
    if (!user) return false;
    
    // Check if user has an approving role
    const hasApprovingRole = this.userStore.hasAnyRole(['CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'REVIEWER']);
    if (!hasApprovingRole) {
      return false;
    }

    // Check if the current user is the creator (Segregation of Duties)
    // EXCEPTION: Client Admins are exempt from this rule
    const isClientAdmin = this.userStore.hasAnyRole(['CLIENT_ADMIN']);
    if (assessment.attributes.created_by && user.id === assessment.attributes.created_by && !isClientAdmin) {
      return false;
    }
    
    return true;
  }
}