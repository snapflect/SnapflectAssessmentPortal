import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { QuillModule } from 'ngx-quill';
import { GlobalSearchPipe } from '../../../../../shared/pipes/global-search.pipe';
import { UserStore } from '../../../../../shared/stores/user.store';

interface Question {
  id: number;
  uuid: string;
  attributes: {
    question_code: string;
    question_type: string;
    difficulty_level: string;
    question_text: string;
    max_score: number;
    status: string;
  };
  relationships?: {
    questionBank?: { uuid: string; attributes: { bank_name: string } };
  };
}

@Component({
  selector: 'app-question-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlideOverComponent, QuillModule, GlobalSearchPipe],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Questions</h2>
          <p class="text-slate-400 text-sm mt-1">Author and manage questions using the rich text studio.</p>
        </div>
        <button (click)="openCreateForm()" class="btn-primary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Question
        </button>
      </div>

      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div class="flex gap-4">
            <div class="relative w-64">
              <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input type="text" [(ngModel)]="searchTerm" class="input-field pl-10 py-2 text-sm bg-surface-darker/50" placeholder="Search questions...">
            </div>
            
            <select class="input-field py-2 text-sm bg-surface-darker/50 w-48" (change)="filterByBank($event)">
              <option value="">All Question Banks</option>
              <option *ngFor="let bank of banks" [value]="bank.uuid">{{ getBankDisplayName(bank) }}</option>
            </select>
          </div>
        </div>

        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="text-xs text-slate-400 uppercase bg-surface-dark sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Code</th>
                <th scope="col" class="px-6 py-4 font-medium">Preview</th>
                <th scope="col" class="px-6 py-4 font-medium">Bank</th>
                <th scope="col" class="px-6 py-4 font-medium">Type</th>
                <th scope="col" class="px-6 py-4 font-medium">Difficulty</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loading" [class.pointer-events-none]="loading" class="transition-opacity duration-300">
              <tr *ngIf="loading && questions.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading questions...
                </td>
              </tr>
              <ng-container *ngIf="questions | globalSearch: searchTerm as filteredQuestions">
                <tr *ngIf="!loading && filteredQuestions.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                    No questions found matching your search.
                  </td>
                </tr>
                <tr *ngFor="let q of filteredQuestions" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4 font-medium text-brand-light">{{ q.attributes.question_code }}</td>
                  <td class="px-6 py-4">
                    <!-- Strip HTML tags for preview -->
                    <div class="line-clamp-2 text-white/90" [innerHTML]="q.attributes.question_text | slice:0:100"></div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-slate-400 text-xs">{{ getBankDisplayName(q.relationships?.questionBank) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                      {{ q.attributes.question_type }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded uppercase"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': q.attributes.difficulty_level === 'EASY',
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20': q.attributes.difficulty_level === 'MEDIUM',
                            'bg-red-500/10 text-red-400 border border-red-500/20': q.attributes.difficulty_level === 'HARD'
                          }">
                      {{ q.attributes.difficulty_level }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button *ngIf="!isGlobalQuestion(q)" class="text-slate-400 hover:text-white transition-colors" (click)="openEditForm(q)">Edit</button>
                    <button *ngIf="isGlobalQuestion(q)" class="text-slate-400 hover:text-white transition-colors" (click)="openEditForm(q)" title="View Only">View</button>
                    <button class="text-brand hover:text-brand-light transition-colors" (click)="openCloneModal(q)">Clone</button>
                    <button *ngIf="!isGlobalQuestion(q)" class="text-slate-400 hover:text-red-400 transition-colors" (click)="deleteQuestion(q.uuid)">Delete</button>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit SlideOver -->
      <app-slide-over [isOpen]="isSlideOverOpen" 
                      [title]="isEditing ? 'Edit Question' : 'Create Question'" 
                      description="Author question content and define options."
                      width="w-[800px]"
                      (closeEvent)="closeForm()">
        <form [formGroup]="questionForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Question Bank *</label>
              <select formControlName="question_bank_uuid" class="input-field">
                <option value="">Select a Bank...</option>
                <option *ngFor="let bank of banks" [value]="bank.uuid">{{ getBankDisplayName(bank) }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Question Code *</label>
              <input type="text" formControlName="question_code" class="input-field" placeholder="e.g. Q-MATH-01">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Type *</label>
              <select formControlName="question_type" class="input-field" (change)="onTypeChange()">
                <option value="MCQ">Multiple Choice</option>
                <option value="MULTI_SELECT">Multi Select</option>
                <option value="ESSAY">Essay</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Difficulty *</label>
              <select formControlName="difficulty_level" class="input-field">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Max Score *</label>
              <input type="number" formControlName="max_score" class="input-field" min="1">
            </div>
          </div>

          <!-- Rich Text Editor for Question Stem -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Question Text (Stem) *</label>
            <div class="bg-white rounded-md text-black overflow-hidden border border-white/20">
               <quill-editor formControlName="question_text" 
                            [styles]="{height: '200px'}" 
                            placeholder="Type the question content here...">
              </quill-editor>
            </div>
          </div>

          <!-- Explanation -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Explanation (Optional)</label>
            <textarea formControlName="explanation" class="input-field h-16 resize-none" placeholder="Explanation shown after test or in review..."></textarea>
          </div>

          <!-- Options Builder (Only for MCQ, MULTI_SELECT, TRUE_FALSE) -->
          <div *ngIf="questionForm.get('question_type')?.value !== 'ESSAY'" class="border-t border-white/10 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-bold text-white">Answer Options</h4>
              <button type="button" class="text-xs btn-secondary py-1 px-3" (click)="addOption()">+ Add Option</button>
            </div>

            <div formArrayName="options" class="space-y-3">
              <div *ngFor="let opt of options.controls; let i=index" [formGroupName]="i" class="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                
                <div class="pt-2">
                  <input type="checkbox" formControlName="is_correct" 
                         class="w-5 h-5 rounded border-white/20 bg-black/50 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                         title="Mark as correct answer">
                </div>
                
                <div class="flex-1">
                  <input type="text" formControlName="option_text" class="input-field text-sm py-2" placeholder="Option text...">
                </div>
                
                <div class="w-16">
                  <input type="number" formControlName="display_order" class="input-field text-sm py-2 text-center" title="Order">
                </div>

                <button type="button" class="p-2 text-slate-500 hover:text-red-400 transition-colors" (click)="removeOption(i)" title="Remove Option">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

              </div>
              
              <div *ngIf="options.length === 0" class="text-xs text-red-400">At least one option is required for this question type.</div>
            </div>
          </div>

          <div class="pt-6 flex justify-end space-x-3 border-t border-white/10 mt-8 pb-8">
            <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
            <button *ngIf="!isViewingGlobal" type="submit" class="btn-primary" [disabled]="questionForm.invalid || submitting || (options.length === 0 && questionForm.get('question_type')?.value !== 'ESSAY')">
              <span *ngIf="submitting">Saving...</span>
              <span *ngIf="!submitting">Save Question</span>
            </button>
          </div>
        </form>
      </app-slide-over>

      <!-- Clone Modal -->
      <div *ngIf="isCloneModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="glass-card w-full max-w-md overflow-hidden animate-slide-up shadow-2xl shadow-brand/20">
          <div class="p-6 border-b border-white/10 bg-black/20">
            <h3 class="text-xl font-bold text-white">Clone Question</h3>
            <p class="text-sm text-slate-400 mt-1">Select a local bank to clone this question into.</p>
          </div>
          
          <div class="p-6">
            <label class="block text-sm font-medium text-slate-300 mb-1">Target Question Bank *</label>
            <select [(ngModel)]="cloneTargetBankUuid" class="input-field mb-4">
              <option value="">Select a Bank...</option>
              <ng-container *ngFor="let bank of banks">
                 <!-- Clients can only clone into their own non-system banks -->
                 <option *ngIf="!bank.attributes.is_system_bank || isPlatformAdmin" [value]="bank.uuid">{{ getBankDisplayName(bank) }}</option>
              </ng-container>
            </select>
          </div>
          
          <div class="p-6 border-t border-white/10 bg-black/30 flex justify-end space-x-3">
            <button class="btn-secondary" (click)="isCloneModalOpen = false">Cancel</button>
            <button class="btn-primary" (click)="submitClone()" [disabled]="!cloneTargetBankUuid || submittingClone">
              {{ submittingClone ? 'Cloning...' : 'Clone Question' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuestionListPageComponent implements OnInit {
  questions: Question[] = [];
  banks: any[] = [];
  loading = true;
  searchTerm = '';
  isSlideOverOpen = false;
  isEditing = false;
  submitting = false;
  currentEditUuid: string | null = null;
  
  questionForm: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private userStore = inject(UserStore);

  isPlatformAdmin = false;
  isViewingGlobal = false;
  
  // Clone Modal State
  isCloneModalOpen = false;
  cloneTargetBankUuid = '';
  questionToCloneUuid = '';
  submittingClone = false;

  constructor() {
    this.questionForm = this.fb.group({
      question_bank_uuid: ['', Validators.required],
      question_code: ['', Validators.required],
      question_type: ['MCQ', Validators.required],
      difficulty_level: ['MEDIUM', Validators.required],
      question_text: ['', Validators.required],
      explanation: [''],
      max_score: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([])
    });
  }

  get options() {
    return this.questionForm.get('options') as FormArray;
  }

  ngOnInit() {
    this.isPlatformAdmin = this.userStore.hasAnyRole(['PLATFORM_ADMIN', 'Platform Admin']);
    this.fetchBanks();
    this.fetchQuestions();
  }

  fetchBanks() {
    this.http.get<any>(`${environment.apiUrl}/assessment/question-banks?per_page=100`)
      .subscribe({
        next: (res) => {
          const payload = res.data || res;
          this.banks = Array.isArray(payload) ? payload : (payload.data || []);
        },
        error: (err) => console.error(err)
      });
  }

  fetchQuestions(bankUuid: string = '') {
    this.loading = true;
    let url = `${environment.apiUrl}/assessment/questions?include=questionBank`;
    if (bankUuid) {
      url += `&question_bank_uuid=${bankUuid}`;
    }
    
    this.http.get<any>(url)
      .subscribe({
        next: (response) => {
          const payload = response.data ? response.data : response;
          this.questions = Array.isArray(payload) ? payload : (payload.data || []);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching questions', err);
          this.loading = false;
        }
      });
  }

  filterByBank(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.fetchQuestions(val);
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

  onTypeChange() {
    const type = this.questionForm.get('question_type')?.value;
    if (type === 'ESSAY') {
      while (this.options.length !== 0) {
        this.options.removeAt(0);
      }
    } else if (this.options.length === 0) {
      this.addOption(); // Add a default option if they switch from Essay
    }
  }

  addOption(text = '', isCorrect = false, displayOrder = this.options.length + 1) {
    this.options.push(this.fb.group({
      option_text: [text, Validators.required],
      display_order: [displayOrder, Validators.required],
      is_correct: [isCorrect]
    }));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  openCreateForm() {
    this.isEditing = false;
    this.currentEditUuid = null;
    this.isViewingGlobal = false;
    this.questionForm.enable();
    this.questionForm.reset({
      question_type: 'MCQ',
      difficulty_level: 'MEDIUM',
      max_score: 1
    });
    this.options.clear();
    this.addOption('Option 1');
    this.addOption('Option 2');
    this.isSlideOverOpen = true;
  }

  openEditForm(q: Question) {
    this.isEditing = true;
    this.currentEditUuid = q.uuid;
    
    // In a real scenario, you'd fetch the specific question's options first if they aren't included in the list view
    // Assuming backend returns options when fetching a single question, we should fetch it:
    this.questionForm.enable();
    this.http.get<any>(`${environment.apiUrl}/assessment/questions/${q.uuid}?include=options`)
      .subscribe(res => {
        const fullQ = res.data || res;
        this.questionForm.patchValue({
          question_bank_uuid: q.relationships?.questionBank?.uuid || '',
          question_code: fullQ.attributes.question_code,
          question_type: fullQ.attributes.question_type,
          difficulty_level: fullQ.attributes.difficulty_level,
          question_text: fullQ.attributes.question_text,
          explanation: fullQ.attributes.explanation,
          max_score: fullQ.attributes.max_score
        });
        
        this.options.clear();
        if (fullQ.relationships?.options) {
           fullQ.relationships.options.forEach((opt: any) => {
             this.addOption(opt.attributes.option_text, opt.attributes.is_correct, opt.attributes.display_order);
           });
        }
        
        this.isViewingGlobal = this.isGlobalQuestion(q);
        
        if (this.isViewingGlobal) {
          this.questionForm.disable();
        } else {
          // Intentionally restrict changing the structural code for existing questions
          this.questionForm.get('question_code')?.disable();
        }
        
        this.isSlideOverOpen = true;
      });
  }

  async closeForm(force: boolean = false) {
    if (!force && this.questionForm.dirty) {
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
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    const payload = this.questionForm.getRawValue();

    if (this.isEditing && this.currentEditUuid) {
      this.http.put(`${environment.apiUrl}/assessment/questions/${this.currentEditUuid}`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Question Updated', 'The question has been successfully updated.');
            this.closeForm(true);
            this.fetchQuestions();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to update question.';
            this.toastService.error('Error', msg);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/assessment/questions`, payload)
        .subscribe({
          next: () => {
            this.submitting = false;
            this.toastService.success('Question Created', 'The new question has been successfully authored.');
            this.closeForm(true);
            this.fetchQuestions();
          },
          error: (err) => {
            this.submitting = false;
            const msg = err.error?.message || 'Failed to create question.';
            this.toastService.error('Error', msg);
          }
        });
    }
  }

  async deleteQuestion(uuid: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/assessment/questions/${uuid}`)
        .subscribe({
          next: () => {
            this.toastService.success('Question Deleted', 'The question was removed successfully.');
            this.fetchQuestions();
          }
        });
    }
  }
  
  isGlobalQuestion(q: Question): boolean {
    if (this.isPlatformAdmin) return false; // Admins can edit anything
    const bank = q.relationships?.questionBank;
    if (bank && (bank as any).attributes?.is_system_bank) {
        return true;
    }
    // Also check if organization_id on the question doesn't match UserStore?
    // In our backend logic, is_system_bank implies global.
    return false;
  }
  
  openCloneModal(q: Question) {
    this.questionToCloneUuid = q.uuid;
    this.cloneTargetBankUuid = '';
    this.isCloneModalOpen = true;
  }
  
  submitClone() {
    this.submittingClone = true;
    const payload = { target_question_bank_uuid: this.cloneTargetBankUuid };
    this.http.post(`${environment.apiUrl}/assessment/questions/${this.questionToCloneUuid}/clone`, payload)
      .subscribe({
        next: () => {
          this.submittingClone = false;
          this.isCloneModalOpen = false;
          this.toastService.success('Cloned!', 'Question cloned successfully.');
          this.fetchQuestions();
        },
        error: (err) => {
          this.submittingClone = false;
          const msg = err.error?.message || 'Failed to clone question.';
          this.toastService.error('Error', msg);
        }
      });
  }
}