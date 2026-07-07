import { UserStore } from '../../../../../shared/stores/user.store';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface QuestionTag {
  uuid: string;
  attributes: {
    tag_name: string;
    status: string;
  };
}

@Component({
  selector: 'app-question-tag-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Question Tags</h2>
          <p class="text-muted text-sm mt-1">Manage tags used to categorize and organize questions.</p>
        </div>
        <div>
          <button *ngIf="userStore.hasAnyPermission(['Assessment.Metadata.Manage'])" (click)="openForm()" class="btn-primary flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Tag
          </button>
        </div>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light bg-input-bg flex justify-between items-center">
          <p class="text-sm text-muted">
            Showing <span class="text-main font-medium">{{ tags.length }}</span> tags
          </p>
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-1.5 text-sm bg-page/50" placeholder="Search tags...">
          </div>
        </div>
        <div class="overflow-auto flex-1">
          <div *ngIf="loading" class="flex items-center justify-center py-16">
            <svg class="animate-spin h-8 w-8 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <table *ngIf="!loading" class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <ng-container *ngIf="tags | globalSearch: searchTerm as finalTags">
              <tbody>
                <tr *ngIf="finalTags.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">No tags found.</td>
                </tr>
                <tr *ngFor="let t of finalTags" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4">
                    <p class="text-main font-medium">{{ t.attributes.tag_name }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded uppercase"
                          [ngClass]="t.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-muted border border-slate-500/20'">
                      {{ t.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button *ngIf="userStore.hasAnyPermission(['Assessment.Metadata.Manage'])" class="text-muted hover:text-main transition-colors" (click)="openEdit(t)">Edit</button>
                    <button *ngIf="(userStore.hasAnyPermission(['Assessment.Metadata.Manage'])) && userStore.hasAnyPermission(['Assessment.Metadata.Manage'])"  class="text-muted hover:text-red-400 transition-colors" (click)="deleteTag(t.uuid)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </ng-container>
          </table>
        </div>
      </div>

      <app-slide-over [isOpen]="isFormOpen"
                      [title]="editingTag ? 'Edit Tag' : 'Add Tag'"
                      description="Manage question tag details."
                      (closeEvent)="closeForm()">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Name *</label>
            <input type="text" formControlName="tag_name" class="input-field" placeholder="e.g. Information Technology">
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Save Tag' }}
            </button>
          </div>
        </form>
      </app-slide-over>
    </div>
  `
})
export class QuestionTagListPageComponent implements OnInit {
  tags: QuestionTag[] = [];
  loading = true;
  searchTerm = '';
  isFormOpen = false;
  editingTag: QuestionTag | null = null;
  submitting = false;

  form: FormGroup;
  userStore = inject(UserStore);

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  constructor() {
    this.form = this.fb.group({
      tag_name: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchTags();
  }

  fetchTags() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/tags?per_page=100`)
      .subscribe({
        next: (res) => {
          this.tags = res.data || res;
          this.loading = false;
        },
        error: (err) => { 
          console.error(err); 
          this.loading = false; 
        }
      });
  }

  openForm() {
    this.editingTag = null;
    this.form.enable();
    this.form.reset({ status: 'ACTIVE' });
    this.isFormOpen = true;
  }

  async closeForm(force: boolean = false) {
    if (!force && this.form.dirty) {
      const confirmed = await this.confirmService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        variant: 'warning',
        confirmText: 'Discard',
        cancelText: 'Keep Editing'
      });
      if (!confirmed) return;
    }
    this.isFormOpen = false;
  }

  openEdit(t: QuestionTag) {
    this.editingTag = t;
    this.form.patchValue({
      tag_name: t.attributes.tag_name,
      status: t.attributes.status
    });
    this.isFormOpen = true;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = this.form.getRawValue();
    const req = this.editingTag
      ? this.http.put(`${environment.apiUrl}/assessment/tags/${this.editingTag.uuid}`, payload)
      : this.http.post(`${environment.apiUrl}/assessment/tags`, payload);

    req.subscribe({
      next: () => { 
        this.submitting = false; 
        this.toastService.success('Tag Saved', 'The tag has been saved successfully.');
        this.closeForm(true); 
        this.fetchTags(); 
      },
      error: (err) => { 
        this.submitting = false;
        const msg = err.error?.message || 'Failed to save tag.';
        this.toastService.error('Error', msg);
      }
    });
  }

  async deleteTag(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Tag',
      message: 'Are you sure you want to delete this tag? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/assessment/tags/${uuid}`)
        .subscribe({ 
          next: () => {
            this.toastService.success('Tag Deleted', 'The tag was removed successfully.');
            this.fetchTags();
          } 
        });
    }
  }
}
