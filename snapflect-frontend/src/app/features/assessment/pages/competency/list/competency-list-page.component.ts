import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface CompetencyGroup {
  uuid: string;
  attributes: { group_code: string; group_name: string; description: string; status: string };
}

interface Competency {
  uuid: string;
  attributes: {
    competency_code: string;
    competency_name: string;
    description: string;
    proficiency_level: string;
    status: string;
  };
  relationships?: {
    group?: { uuid: string; attributes: { group_name: string } };
  };
}

@Component({
  selector: 'app-competency-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Competency Framework</h2>
          <p class="text-slate-400 text-sm mt-1">Define competency groups and map individual competencies for assessment blueprints.</p>
        </div>
        <div class="flex gap-3">
          <button (click)="openGroupForm()" class="btn-secondary flex items-center text-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Group
          </button>
          <button (click)="openCompetencyForm()" class="btn-primary flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Competency
          </button>
        </div>
      </div>

      <!-- Two-column layout: Groups left, Competencies right -->
      <div class="flex gap-5 flex-1 overflow-hidden">

        <!-- Competency Groups Panel -->
        <div class="w-72 flex flex-col">
          <div class="glass-card flex-1 overflow-hidden flex flex-col">
            <div class="px-4 py-3 border-b border-white/10 bg-black/20">
              <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Groups</h3>
            </div>
            <div class="overflow-y-auto flex-1 p-2">
              <button (click)="selectGroup(null)"
                      class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                      [ngClass]="selectedGroupUuid === null ? 'bg-brand/20 text-brand-light' : 'text-slate-400 hover:bg-white/5 hover:text-white'">
                All Competencies
              </button>
              <button *ngFor="let g of groups"
                      (click)="selectGroup(g.uuid)"
                      class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 flex items-center justify-between"
                      [ngClass]="selectedGroupUuid === g.uuid ? 'bg-brand/20 text-brand-light' : 'text-slate-400 hover:bg-white/5 hover:text-white'">
                <span>{{ g.attributes.group_name }}</span>
                <span class="text-[10px] opacity-60">{{ g.attributes.group_code }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Competencies Panel -->
        <div class="flex-1 glass-card overflow-hidden flex flex-col">
          <div class="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <p class="text-sm text-slate-400">
              Showing <span class="text-white font-medium">{{ filteredCompetencies.length }}</span> competencies
            </p>
            <div class="relative w-64">
              <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-1.5 text-sm bg-surface-darker/50" placeholder="Search competencies...">
            </div>
          </div>
          <div class="overflow-auto flex-1">
            <div *ngIf="loading && competencies.length === 0" class="flex items-center justify-center py-16">
              <svg class="animate-spin h-8 w-8 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <table *ngIf="competencies.length > 0" class="w-full text-left text-sm text-slate-300 transition-opacity duration-300" [class.opacity-50]="loading" [class.pointer-events-none]="loading">
              <thead class="text-xs text-slate-400 uppercase bg-surface-dark sticky top-0 z-10 shadow-sm">
                <tr>
                  <th scope="col" class="px-6 py-4 font-medium">Code</th>
                  <th scope="col" class="px-6 py-4 font-medium">Name</th>
                  <th scope="col" class="px-6 py-4 font-medium">Group</th>
                  <th scope="col" class="px-6 py-4 font-medium">Proficiency</th>
                  <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <ng-container *ngIf="filteredCompetencies | globalSearch: searchTerm as finalCompetencies">
                <tbody>
                  <tr *ngIf="finalCompetencies.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500">No competencies found matching your search.</td>
                  </tr>
                  <tr *ngFor="let c of finalCompetencies" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 font-medium text-brand-light">{{ c.attributes.competency_code }}</td>
                    <td class="px-6 py-4">
                      <p class="text-white font-medium">{{ c.attributes.competency_name }}</p>
                      <p class="text-xs text-slate-500 mt-0.5">{{ c.attributes.description }}</p>
                    </td>
                    <td class="px-6 py-4 text-slate-400 text-xs">{{ c.relationships?.group?.attributes?.group_name || '–' }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-0.5 text-[10px] font-semibold rounded uppercase"
                            [ngClass]="getProficiencyClass(c.attributes.proficiency_level)">
                        {{ c.attributes.proficiency_level }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-3">
                      <button class="text-slate-400 hover:text-white transition-colors" (click)="openEditCompetency(c)">Edit</button>
                      <button class="text-slate-400 hover:text-red-400 transition-colors" (click)="deleteCompetency(c.uuid)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </ng-container>
            </table>
          </div>
        </div>
      </div>

      <!-- Group SlideOver -->
      <app-slide-over [isOpen]="isGroupFormOpen" title="Create Competency Group" description="Groups help categorize related competencies." (closeEvent)="closeGroupForm()">
        <form [formGroup]="groupForm" (ngSubmit)="submitGroup()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Group Code *</label>
            <input type="text" formControlName="group_code" class="input-field" placeholder="e.g. TECH">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Group Name *</label>
            <input type="text" formControlName="group_name" class="input-field" placeholder="e.g. Technical Skills">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-20 resize-none"></textarea>
          </div>
          <div class="pt-6 flex justify-end space-x-3 border-t border-white/10">
            <button type="button" class="btn-secondary" (click)="closeGroupForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="groupForm.invalid">Save Group</button>
          </div>
        </form>
      </app-slide-over>

      <!-- Competency SlideOver -->
      <app-slide-over [isOpen]="isCompetencyFormOpen"
                      [title]="editingCompetency ? 'Edit Competency' : 'Add Competency'"
                      description="Define a measurable competency for the framework."
                      (closeEvent)="closeCompetencyForm()">
        <form [formGroup]="competencyForm" (ngSubmit)="submitCompetency()" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Code *</label>
              <input type="text" formControlName="competency_code" class="input-field" placeholder="e.g. TECH-SQL-01">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Group</label>
              <select formControlName="group_uuid" class="input-field">
                <option value="">None</option>
                <option *ngFor="let g of groups" [value]="g.uuid">{{ g.attributes.group_name }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Name *</label>
            <input type="text" formControlName="competency_name" class="input-field" placeholder="e.g. SQL Query Writing">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Proficiency Level *</label>
            <select formControlName="proficiency_level" class="input-field">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-20 resize-none" placeholder="Describe what this competency measures..."></textarea>
          </div>
          <div class="pt-6 flex justify-end space-x-3 border-t border-white/10">
            <button type="button" class="btn-secondary" (click)="closeCompetencyForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="competencyForm.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Save Competency' }}
            </button>
          </div>
        </form>
      </app-slide-over>
    </div>
  `
})
export class CompetencyListPageComponent implements OnInit {
  groups: CompetencyGroup[] = [];
  competencies: Competency[] = [];
  filteredCompetencies: Competency[] = [];
  selectedGroupUuid: string | null = null;
  loading = true;
  searchTerm = '';
  isGroupFormOpen = false;
  isCompetencyFormOpen = false;
  editingCompetency: Competency | null = null;
  submitting = false;

  groupForm: FormGroup;
  competencyForm: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  constructor() {
    this.groupForm = this.fb.group({
      group_code: ['', Validators.required],
      group_name: ['', Validators.required],
      description: ['']
    });
    this.competencyForm = this.fb.group({
      competency_code: ['', Validators.required],
      competency_name: ['', Validators.required],
      proficiency_level: ['INTERMEDIATE', Validators.required],
      description: [''],
      group_uuid: ['']
    });
  }

  ngOnInit() {
    this.fetchGroups();
    this.fetchCompetencies();
  }

  fetchGroups() {
    this.http.get<any>(`${environment.apiUrl}/assessment/competency-groups?per_page=100`)
      .subscribe({ next: (res) => this.groups = res.data || res });
  }

  fetchCompetencies() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/competencies?include=group&per_page=200`)
      .subscribe({
        next: (res) => {
          this.competencies = res.data || res;
          this.applyGroupFilter();
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  selectGroup(uuid: string | null) {
    this.selectedGroupUuid = uuid;
    this.applyGroupFilter();
  }

  applyGroupFilter() {
    if (!this.selectedGroupUuid) {
      this.filteredCompetencies = [...this.competencies];
    } else {
      this.filteredCompetencies = this.competencies.filter(c =>
        c.relationships?.group?.uuid === this.selectedGroupUuid
      );
    }
  }

  getProficiencyClass(level: string): string {
    const map: Record<string, string> = {
      'BEGINNER': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'INTERMEDIATE': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'ADVANCED': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'EXPERT': 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return map[level] || 'bg-slate-500/10 text-slate-400';
  }

  openGroupForm() {
    this.groupForm.enable();
    this.groupForm.reset();
    this.isGroupFormOpen = true;
  }

  async closeGroupForm(force: boolean = false) {
    if (!force && this.groupForm.dirty) {
      const confirmed = await this.confirmService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      });
      if (!confirmed) return;
    }
    this.isGroupFormOpen = false;
  }

  submitGroup() {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }
    const payload = this.groupForm.getRawValue();
    this.http.post(`${environment.apiUrl}/assessment/competency-groups`, payload)
      .subscribe({ 
        next: () => { 
          this.toastService.success('Group Created', 'The competency group has been successfully created.');
          this.closeGroupForm(true); 
          this.fetchGroups(); 
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to create group.';
          this.toastService.error('Error', msg);
        } 
      });
  }

  openCompetencyForm() {
    this.editingCompetency = null;
    this.competencyForm.enable();
    this.competencyForm.reset({ proficiency_level: 'INTERMEDIATE' });
    this.isCompetencyFormOpen = true;
  }

  async closeCompetencyForm(force: boolean = false) {
    if (!force && this.competencyForm.dirty) {
      const confirmed = await this.confirmService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      });
      if (!confirmed) return;
    }
    this.isCompetencyFormOpen = false;
  }

  openEditCompetency(c: Competency) {
    this.editingCompetency = c;
    this.competencyForm.patchValue({
      competency_code: c.attributes.competency_code,
      competency_name: c.attributes.competency_name,
      proficiency_level: c.attributes.proficiency_level,
      description: c.attributes.description,
      group_uuid: c.relationships?.group?.uuid || ''
    });
    // Intentionally restrict changing the structural code for existing competencies
    this.competencyForm.get('competency_code')?.disable();
    this.isCompetencyFormOpen = true;
  }

  submitCompetency() {
    if (this.competencyForm.invalid) {
      this.competencyForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = this.competencyForm.getRawValue();
    const req = this.editingCompetency
      ? this.http.put(`${environment.apiUrl}/assessment/competencies/${this.editingCompetency.uuid}`, payload)
      : this.http.post(`${environment.apiUrl}/assessment/competencies`, payload);

    req.subscribe({
      next: () => { 
        this.submitting = false; 
        this.toastService.success('Competency Saved', 'The competency has been saved successfully.');
        this.closeCompetencyForm(true); 
        this.fetchCompetencies(); 
      },
      error: (err) => { 
        this.submitting = false;
        const msg = err.error?.message || 'Failed to save competency.';
        this.toastService.error('Error', msg);
      }
    });
  }

  async deleteCompetency(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Competency',
      message: 'Are you sure you want to delete this competency? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/assessment/competencies/${uuid}`)
        .subscribe({ 
          next: () => {
            this.toastService.success('Competency Deleted', 'The competency was removed successfully.');
            this.fetchCompetencies();
          } 
        });
    }
  }
}