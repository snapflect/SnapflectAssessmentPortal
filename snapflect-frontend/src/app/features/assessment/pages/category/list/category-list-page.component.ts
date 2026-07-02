import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';

interface AssessmentCategory {
  uuid: string;
  attributes: {
    category_code: string;
    category_name: string;
    description: string;
    status: string;
  };
}

@Component({
  selector: 'app-category-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main">Assessment Categories</h2>
          <p class="text-muted text-sm mt-1">Manage global categories used to classify assessments.</p>
        </div>
        <div>
          <button (click)="openForm()" class="btn-primary flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Add Category
          </button>
        </div>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light bg-input-bg flex justify-between items-center">
          <p class="text-sm text-muted">
            Showing <span class="text-main font-medium">{{ categories.length }}</span> categories
          </p>
          <div class="relative w-64">
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-1.5 text-sm bg-page/50" placeholder="Search categories...">
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
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Name</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <ng-container *ngIf="categories | globalSearch: searchTerm as finalCategories">
              <tbody>
                <tr *ngIf="finalCategories.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-slate-500">No categories found.</td>
                </tr>
                <tr *ngFor="let c of finalCategories" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ c.attributes.category_code }}</td>
                  <td class="px-6 py-4">
                    <p class="text-main font-medium">{{ c.attributes.category_name }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ c.attributes.description }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded uppercase"
                          [ngClass]="c.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-muted border border-slate-500/20'">
                      {{ c.attributes.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-muted hover:text-main transition-colors" (click)="openEdit(c)">Edit</button>
                    <button class="text-muted hover:text-red-400 transition-colors" (click)="deleteCategory(c.uuid)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </ng-container>
          </table>
        </div>
      </div>

      <app-slide-over [isOpen]="isFormOpen"
                      [title]="editingCategory ? 'Edit Category' : 'Add Category'"
                      description="Manage assessment category details."
                      (closeEvent)="closeForm()">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Code *</label>
            <input type="text" formControlName="category_code" class="input-field" placeholder="e.g. IT-01">
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Name *</label>
            <input type="text" formControlName="category_name" class="input-field" placeholder="e.g. Information Technology">
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-20 resize-none" placeholder="Describe this category..."></textarea>
          </div>
          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Save Category' }}
            </button>
          </div>
        </form>
      </app-slide-over>
    </div>
  `
})
export class CategoryListPageComponent implements OnInit {
  categories: AssessmentCategory[] = [];
  loading = true;
  searchTerm = '';
  isFormOpen = false;
  editingCategory: AssessmentCategory | null = null;
  submitting = false;

  form: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  constructor() {
    this.form = this.fb.group({
      category_code: ['', Validators.required],
      category_name: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/categories?per_page=100`)
      .subscribe({
        next: (res) => {
          this.categories = res.data || res;
          this.loading = false;
        },
        error: (err) => { 
          console.error(err); 
          this.loading = false; 
        }
      });
  }

  openForm() {
    this.editingCategory = null;
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

  openEdit(c: AssessmentCategory) {
    this.editingCategory = c;
    this.form.patchValue({
      category_code: c.attributes.category_code,
      category_name: c.attributes.category_name,
      status: c.attributes.status,
      description: c.attributes.description
    });
    this.form.get('category_code')?.disable();
    this.isFormOpen = true;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = this.form.getRawValue();
    const req = this.editingCategory
      ? this.http.put(`${environment.apiUrl}/assessment/categories/${this.editingCategory.uuid}`, payload)
      : this.http.post(`${environment.apiUrl}/assessment/categories`, payload);

    req.subscribe({
      next: () => { 
        this.submitting = false; 
        this.toastService.success('Category Saved', 'The category has been saved successfully.');
        this.closeForm(true); 
        this.fetchCategories(); 
      },
      error: (err) => { 
        this.submitting = false;
        const msg = err.error?.message || 'Failed to save category.';
        this.toastService.error('Error', msg);
      }
    });
  }

  async deleteCategory(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/assessment/categories/${uuid}`)
        .subscribe({ 
          next: () => {
            this.toastService.success('Category Deleted', 'The category was removed successfully.');
            this.fetchCategories();
          } 
        });
    }
  }
}
