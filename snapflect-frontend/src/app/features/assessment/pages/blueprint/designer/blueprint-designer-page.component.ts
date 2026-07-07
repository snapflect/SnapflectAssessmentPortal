import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { SlideOverComponent } from '../../../../../shared/components/slide-over/slide-over.component';

interface BlueprintRule {
  uuid: string;
  attributes: {
    difficulty_level: string | null;
    question_type: string | null;
    question_count: number;
    points_per_question: number;
  };
  relationships?: {
    competency?: { uuid: string; attributes: { competency_name: string } };
    tag?: { uuid: string; attributes: { tag_name: string } };
  };
}

interface Blueprint {
  uuid: string;
  attributes: {
    blueprint_code: string;
    title: string;
    description: string;
    status: string;
  };
  relationships?: {
    assessment?: { uuid: string; attributes: { title: string } };
    sections?: BlueprintSection[];
  };
}

interface BlueprintSection {
  uuid: string;
  attributes: {
    title: string;
    description: string;
    display_order: number;
    time_limit_minutes: number;
    selection_strategy: string;
  };
  relationships?: {
    rules?: BlueprintRule[];
    sectionQuestions?: {
      uuid: string;
      attributes: { display_order: number };
      relationships?: {
        question?: {
          uuid: string;
          attributes: { question_text: string; question_type: string; difficulty_level: string };
        }
      }
    }[];
  };
}

@Component({
  selector: 'app-blueprint-designer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideOverComponent, RouterLink],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex flex-col gap-2 mb-6">
        <a *ngIf="sourceAssessmentUuid" routerLink="/authoring/assessments" class="text-brand hover:text-brand-light text-sm flex items-center gap-1.5 w-max transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Assessment Catalog
        </a>
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-main">Blueprint Designer</h2>
            <p class="text-muted text-sm mt-1">Design assessment structure — define sections, rules, and question distribution.</p>
          </div>
        </div>
      </div>

      <!-- Blueprint selector + sections view -->
      <div class="flex gap-5 flex-1 overflow-hidden">

        <!-- Blueprint List -->
        <div class="w-80 flex flex-col gap-3">
          <div class="glass-card flex-1 overflow-hidden flex flex-col">
            <div class="px-4 py-3 border-b border-border-light bg-input-bg flex justify-between items-center">
              <h3 class="text-sm font-semibold text-muted uppercase tracking-wider">Blueprints</h3>
            </div>
            <div class="overflow-y-auto flex-1 p-3 space-y-2">
              <div *ngIf="loadingBlueprints" class="text-center py-8 text-slate-500 text-sm">Loading...</div>
              <div *ngIf="!loadingBlueprints && blueprints.length === 0" class="text-center py-8 text-slate-500 text-sm">No blueprints found.</div>
              <button *ngFor="let bp of blueprints"
                      (click)="selectBlueprint(bp)"
                      class="w-full text-left p-3 rounded-lg transition-all border"
                      [ngClass]="activeBlueprintUuid === bp.uuid
                        ? 'bg-brand/10 border-brand/40 text-main'
                        : 'hover:brightness-110 border-white/5 text-muted hover:bg-white/10 hover:text-main'">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-mono text-brand-light">{{ bp.attributes.blueprint_code }}</span>
                  <span class="px-1.5 py-0.5 text-[10px] rounded uppercase font-bold"
                        [ngClass]="bp.attributes.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-muted'">
                    {{ bp.attributes.status }}
                  </span>
                </div>
                <p class="font-medium text-sm leading-tight">{{ bp.attributes.title }}</p>
                <p class="text-xs text-slate-600 mt-1">{{ bp.relationships?.assessment?.attributes?.title || 'No assessment linked' }}</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Blueprint Designer Canvas -->
        <div class="flex-1 glass-card overflow-hidden flex flex-col">
          <!-- No blueprint selected state -->
          <div *ngIf="!activeBlueprint" class="flex-1 flex flex-col items-center justify-center text-slate-600">
            <svg class="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
            <p class="text-xl">Select a blueprint to design its structure</p>
            <p class="text-sm mt-2">Choose a blueprint from the list on the left</p>
          </div>

          <!-- Blueprint Design Canvas -->
          <div *ngIf="activeBlueprint" class="flex-1 flex flex-col overflow-hidden">
            <!-- Canvas Header -->
            <div class="p-4 border-b border-border-light bg-input-bg flex justify-between items-center">
              <div>
                <h3 class="text-main font-semibold">{{ activeBlueprint.attributes.title }}</h3>
                <p class="text-xs text-muted mt-0.5">{{ activeBlueprint.attributes.blueprint_code }}</p>
              </div>
              <button (click)="openSectionForm()" class="btn-primary text-sm py-1.5 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Add Section
              </button>
            </div>

            <!-- Sections -->
            <div class="flex-1 overflow-y-auto p-5 space-y-4">
              <div *ngIf="!sections || sections.length === 0" class="text-center py-12 text-slate-600">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                </svg>
                <p class="text-sm">No sections yet. Click "Add Section" to start designing.</p>
              </div>

              <!-- Section Cards -->
              <div *ngFor="let section of sections; let i = index"
                   class="hover:brightness-110 border border-border-light rounded-xl overflow-hidden hover:border-brand/20 transition-all">
                <!-- Section Header -->
                <div class="px-5 py-4 flex items-center justify-between bg-input-bg">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand-light font-bold text-sm">
                      {{ i + 1 }}
                    </div>
                    <div>
                      <h4 class="text-main font-semibold text-sm">{{ section.attributes.title }}</h4>
                      <p class="text-xs text-slate-500">{{ section.attributes.time_limit_minutes }} min time limit</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500">Order: {{ section.attributes.display_order }}</span>
                  </div>
                </div>

                <!-- Section Rules -->
                <div class="px-5 py-4">
                  <p class="text-sm text-muted">{{ section.attributes.description }}</p>
                  
                  <div class="mt-4 space-y-2">
                    <!-- If FIXED, show picked questions -->
                    <div *ngIf="section.attributes.selection_strategy === 'FIXED'" class="space-y-2">
                      <div *ngFor="let sq of section.relationships?.sectionQuestions" class="bg-input-bg border border-border-light rounded p-3 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                          <span class="bg-brand/20 text-brand-light text-xs font-bold px-2 py-1 rounded">
                            Q{{ sq.attributes.display_order }}
                          </span>
                          <span class="text-sm text-main truncate max-w-md" [innerHTML]="sq.relationships?.question?.attributes?.question_text"></span>
                          <span class="text-xs text-slate-500">{{ sq.relationships?.question?.attributes?.question_type }}</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 pt-2">
                        <div class="flex-1 border-t border-dashed border-border-light"></div>
                        <button class="text-xs btn-secondary py-1.5 px-3" (click)="openQuestionPicker(section.uuid)">+ Add Specific Questions</button>
                      </div>
                    </div>

                    <!-- If RANDOM, show Rules Loop -->
                    <div *ngIf="section.attributes.selection_strategy === 'RANDOM'" class="space-y-2">
                      <div *ngFor="let rule of section.relationships?.rules" class="bg-input-bg border border-border-light rounded p-3 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                          <span class="bg-brand/20 text-brand-light text-xs font-bold px-2 py-1 rounded">
                            {{ rule.attributes.question_count }} Questions
                          </span>
                          <span class="bg-slate-700/50 text-muted text-xs px-2 py-1 rounded border border-slate-600">
                            {{ rule.attributes.points_per_question }} pts each
                          </span>
                          
                          <div class="text-sm text-muted flex items-center flex-wrap gap-2">
                            <span class="text-main">{{ rule.relationships?.competency?.attributes?.competency_name || 'Any Competency' }}</span>
                            <span class="text-slate-500">&bull;</span>
                            
                            <span *ngIf="rule.relationships?.tag" class="text-indigo-400">
                              #{{ rule.relationships?.tag?.attributes?.tag_name }}
                            </span>
                            <span *ngIf="rule.relationships?.tag" class="text-slate-500">&bull;</span>
                            
                            <span class="text-sky-300">{{ rule.attributes.question_type ? (rule.attributes.question_type | uppercase) : 'ANY TYPE' }}</span>
                            <span class="text-slate-500">&bull;</span>
                            
                            <span [ngClass]="{
                              'text-emerald-400': rule.attributes.difficulty_level === 'EASY',
                              'text-amber-400': rule.attributes.difficulty_level === 'MEDIUM',
                              'text-rose-400': rule.attributes.difficulty_level === 'HARD',
                              'text-muted': !rule.attributes.difficulty_level
                            }">{{ rule.attributes.difficulty_level || 'Any Difficulty' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Add Rule Button Row -->
                      <div class="flex items-center gap-2 pt-2">
                        <div class="flex-1 border-t border-dashed border-border-light"></div>
                        <button class="text-xs btn-secondary py-1.5 px-3" (click)="openRuleForm(section.uuid)">+ Add Rule</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Form SlideOver -->
      <app-slide-over [isOpen]="isSectionFormOpen" title="Add Section" description="Sections divide an assessment into logical parts." (close)="isSectionFormOpen = false">
        <form [formGroup]="sectionForm" (ngSubmit)="submitSection()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Section Title *</label>
            <input type="text" formControlName="title" class="input-field" placeholder="e.g. Part A: Core Knowledge">
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea formControlName="description" class="input-field h-20 resize-none" placeholder="Instructions or context for candidates..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Display Order *</label>
              <input type="number" formControlName="display_order" class="input-field" min="1">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Time Limit (min)</label>
              <input type="number" formControlName="time_limit_minutes" class="input-field" min="0" placeholder="0 = no limit">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Weight (%)</label>
              <input type="number" formControlName="section_weight" class="input-field" min="0" max="100" placeholder="e.g. 25">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Selection Strategy *</label>
              <select formControlName="selection_strategy" class="input-field">
                <option value="FIXED">Fixed (All questions)</option>
                <option value="RANDOM">Random Selection</option>
              </select>
            </div>
          </div>
          <div class="pt-6 flex justify-end space-x-3 border-t border-border-light">
            <button type="button" class="btn-secondary" (click)="isSectionFormOpen = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="sectionForm.invalid || submittingSection">
              {{ submittingSection ? 'Saving...' : 'Add Section' }}
            </button>
          </div>
        </form>
      </app-slide-over>

      <!-- Rule Form SlideOver -->
      <app-slide-over [isOpen]="isRuleFormOpen" title="Add Rule" description="Configure question pooling rules." (close)="isRuleFormOpen = false">
        <form [formGroup]="ruleForm" (ngSubmit)="submitRule()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Question Count *</label>
              <input type="number" formControlName="question_count" class="input-field" min="1" placeholder="e.g. 5">
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Points Per Question *</label>
              <input type="number" formControlName="points_per_question" class="input-field" min="1">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Difficulty Level</label>
              <select formControlName="difficulty_level" class="input-field">
                <option value="ANY">Any Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Question Type</label>
              <select formControlName="question_type" class="input-field">
                <option value="ANY">Any Type</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="CODING">Coding</option>
                <option value="ESSAY">Essay / Free Text</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Competency Area</label>
            <select formControlName="competency_uuid" class="input-field">
              <option [ngValue]="null">Any Competency</option>
              <option *ngFor="let comp of competencies" [value]="comp.uuid">
                {{ comp.attributes.competency_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted mb-1">Question Tag</label>
            <select formControlName="tag_uuid" class="input-field">
              <option [ngValue]="null">Any Tag</option>
              <option *ngFor="let tag of tags" [value]="tag.uuid">
                #{{ tag.attributes.tag_name }}
              </option>
            </select>
          </div>
          
          <div class="pt-6 flex justify-between items-center border-t border-border-light">
            <div>
              <span *ngIf="availablePoolSize !== null" 
                    class="text-xs px-2 py-1 rounded"
                    [ngClass]="availablePoolSize >= ruleForm.value.question_count ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                Available in Bank: {{ availablePoolSize }}
              </span>
              <span *ngIf="availablePoolSize === null" class="text-xs text-slate-500">Checking pool...</span>
            </div>
            <div class="flex space-x-3">
              <button type="button" class="btn-secondary" (click)="isRuleFormOpen = false">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="ruleForm.invalid || submittingRule">
                {{ submittingRule ? 'Saving...' : 'Save Rule' }}
              </button>
            </div>
          </div>
        </form>
      </app-slide-over>

      <!-- Question Picker SlideOver -->
      <app-slide-over [isOpen]="isQuestionPickerOpen" title="Select Questions" description="Browse and assign specific questions to this fixed section." (close)="isQuestionPickerOpen = false">
        <form [formGroup]="questionPickerForm" class="space-y-4 mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Question Bank</label>
              <select formControlName="question_bank_uuid" class="input-field">
                <option [ngValue]="null">All Banks</option>
                <option *ngFor="let bank of banks" [value]="bank.uuid">
                  {{ bank.attributes.bank_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-muted mb-1">Question Tag</label>
              <select formControlName="tag_uuid" class="input-field">
                <option [ngValue]="null">All Tags</option>
                <option *ngFor="let tag of tags" [value]="tag.uuid">
                  #{{ tag.attributes.tag_name }}
                </option>
              </select>
            </div>
          </div>
        </form>

        <div class="flex-1 overflow-y-auto mb-4 border border-border-light rounded-lg bg-input-bg max-h-96">
          <div *ngIf="loadingQuestions" class="p-4 text-center text-slate-500 text-sm">Loading questions...</div>
          <div *ngIf="!loadingQuestions && availableQuestions.length === 0" class="p-4 text-center text-slate-500 text-sm">No questions found matching criteria.</div>
          
          <div *ngFor="let q of availableQuestions" class="p-3 border-b border-white/5 flex items-start gap-3 hover:hover:brightness-110 transition-colors">
            <input type="checkbox" 
                   class="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-brand-light focus:ring-brand"
                   [checked]="selectedQuestionUuids.has(q.uuid)"
                   (change)="toggleQuestionSelection(q.uuid)">
            <div>
              <div class="text-sm text-main line-clamp-2" [innerHTML]="q.attributes.question_text"></div>
              <div class="flex gap-2 mt-1">
                <span class="text-[10px] text-muted bg-slate-800 px-1.5 py-0.5 rounded uppercase">{{ q.attributes.question_type }}</span>
                <span class="text-[10px] text-muted bg-slate-800 px-1.5 py-0.5 rounded uppercase">{{ q.attributes.difficulty_level }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 flex justify-between items-center border-t border-border-light">
          <span class="text-sm text-brand-light">{{ selectedQuestionUuids.size }} selected</span>
          <div class="flex space-x-3">
            <button type="button" class="btn-secondary" (click)="isQuestionPickerOpen = false">Cancel</button>
            <button type="button" class="btn-primary" (click)="submitQuestions()" [disabled]="submittingQuestions">
              {{ submittingQuestions ? 'Saving...' : 'Assign Questions' }}
            </button>
          </div>
        </div>
      </app-slide-over>
    </div>
  `
})
export class BlueprintDesignerPageComponent implements OnInit {
  blueprints: Blueprint[] = [];
  activeBlueprint: Blueprint | null = null;
  activeBlueprintUuid: string | null = null;
  sections: BlueprintSection[] = [];
  competencies: any[] = [];
  tags: any[] = [];
  banks: any[] = [];
  availablePoolSize: number | null = null;
  sourceAssessmentUuid: string | null = null;
  
  loadingBlueprints = true;
  
  isSectionFormOpen = false;
  submittingSection = false;
  sectionForm: FormGroup;

  isRuleFormOpen = false;
  submittingRule = false;
  ruleForm: FormGroup;
  activeSectionUuid: string | null = null;

  isQuestionPickerOpen = false;
  submittingQuestions = false;
  loadingQuestions = false;
  availableQuestions: any[] = [];
  selectedQuestionUuids: Set<string> = new Set();
  questionPickerForm: FormGroup;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  constructor() {
    this.sectionForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      display_order: [1, [Validators.required, Validators.min(1)]],
      time_limit_minutes: [0],
      section_weight: [0, [Validators.min(0), Validators.max(100)]],
      selection_strategy: ['FIXED', Validators.required]
    });

    this.ruleForm = this.fb.group({
      difficulty_level: ['ANY', Validators.required],
      question_type: ['ANY'],
      competency_uuid: [null],
      tag_uuid: [null],
      question_count: [1, [Validators.required, Validators.min(1)]],
      points_per_question: [1, [Validators.required, Validators.min(1)]]
    });

    this.questionPickerForm = this.fb.group({
      question_bank_uuid: [null],
      tag_uuid: [null]
    });
  }

  ngOnInit() {
    this.sourceAssessmentUuid = this.route.snapshot.queryParamMap.get('assessment_uuid');
    this.fetchBlueprints();
    this.fetchCompetencies();
    this.fetchTags();
    this.fetchBanks();

    // Debounce form changes to check pool size
    this.ruleForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        if (this.isRuleFormOpen) {
          this.checkPoolSize();
        }
      });

    this.questionPickerForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        if (this.isQuestionPickerOpen) {
          this.fetchQuestionsForPicker();
        }
      });
  }

  fetchCompetencies() {
    this.http.get<any>(`${environment.apiUrl}/assessment/competencies?per_page=100`)
      .subscribe({
        next: (res) => { this.competencies = res.data || res; },
        error: (err) => console.error(err)
      });
  }

  fetchTags() {
    this.http.get<any>(`${environment.apiUrl}/assessment/tags`)
      .subscribe({
        next: (res) => { this.tags = res.data || res; },
        error: (err) => console.error(err)
      });
  }

  fetchBanks() {
    this.http.get<any>(`${environment.apiUrl}/assessment/question-banks?per_page=100`)
      .subscribe({
        next: (res) => { 
          // Handle paginated responses where the array is inside res.data.data
          this.banks = res.data?.data || res.data || res; 
        },
        error: (err) => console.error(err)
      });
  }

  checkPoolSize() {
    const payload: any = {};
    const formVals = this.ruleForm.value;
    
    if (formVals.difficulty_level && formVals.difficulty_level !== 'ANY') payload.difficulty_level = formVals.difficulty_level;
    if (formVals.question_type && formVals.question_type !== 'ANY') payload.question_type = formVals.question_type;
    if (formVals.competency_uuid) payload.competency_uuid = formVals.competency_uuid;
    if (formVals.tag_uuid) payload.tag_uuid = formVals.tag_uuid;

    this.availablePoolSize = null;
    this.http.post<any>(`${environment.apiUrl}/assessment/questions/count`, payload)
      .subscribe({
        next: (res) => {
          this.availablePoolSize = res.data.available_count;
        },
        error: (err) => console.error(err)
      });
  }

  fetchBlueprints() {
    this.loadingBlueprints = true;
    const targetAssessmentUuid = this.route.snapshot.queryParamMap.get('assessment_uuid');
    
    let url = `${environment.apiUrl}/assessment/blueprints?include=assessment,sections.rules.competency,sections.rules.tag&per_page=100`;
    if (targetAssessmentUuid) {
      url += `&assessment_uuid=${targetAssessmentUuid}`;
    }

    this.http.get<any>(url)
      .subscribe({
        next: (res) => {
          this.blueprints = res.data || res;
          this.loadingBlueprints = false;

          // Auto-select based on query param if present
          const targetAssessmentUuid = this.route.snapshot.queryParamMap.get('assessment_uuid');
          if (targetAssessmentUuid) {
            const targetBp = this.blueprints.find(bp => bp.relationships?.assessment?.uuid === targetAssessmentUuid);
            if (targetBp) {
              this.selectBlueprint(targetBp);
            }
          } else if (this.activeBlueprintUuid) {
            const targetBp = this.blueprints.find(bp => bp.uuid === this.activeBlueprintUuid);
            if (targetBp) {
              this.selectBlueprint(targetBp);
            }
          }
        },
        error: (err) => { console.error(err); this.loadingBlueprints = false; }
      });
  }

  selectBlueprint(bp: Blueprint) {
    this.activeBlueprint = bp;
    this.activeBlueprintUuid = bp.uuid;
    this.sections = bp.relationships?.sections || [];
  }

  openSectionForm() {
    this.sectionForm.reset({ 
      display_order: this.sections.length + 1, 
      time_limit_minutes: 0,
      section_weight: 0,
      selection_strategy: 'FIXED'
    });
    this.isSectionFormOpen = true;
  }

  submitSection() {
    if (this.sectionForm.invalid || !this.activeBlueprintUuid) return;
    this.submittingSection = true;

    this.http.post(`${environment.apiUrl}/assessment/blueprints/${this.activeBlueprintUuid}/sections`, this.sectionForm.value)
      .subscribe({
        next: () => {
          this.submittingSection = false;
          this.isSectionFormOpen = false;
          this.fetchBlueprints(); // Refresh to get updated sections
        },
        error: (err) => { console.error(err); this.submittingSection = false; }
      });
  }

  openRuleForm(sectionUuid: string) {
    this.activeSectionUuid = sectionUuid;
    this.ruleForm.reset({ 
      difficulty_level: 'ANY', 
      question_type: 'ANY', 
      competency_uuid: null, 
      tag_uuid: null, 
      question_count: 1, 
      points_per_question: 1 
    });
    this.isRuleFormOpen = true;
    this.checkPoolSize();
  }

  submitRule() {
    if (this.ruleForm.invalid || !this.activeSectionUuid) return;
    this.submittingRule = true;

    const payload = { ...this.ruleForm.value };
    if (payload.difficulty_level === 'ANY') payload.difficulty_level = null;
    if (payload.question_type === 'ANY') payload.question_type = null;

    this.http.post(`${environment.apiUrl}/assessment/sections/${this.activeSectionUuid}/rules`, payload)
      .subscribe({
        next: () => {
          this.submittingRule = false;
          this.isRuleFormOpen = false;
          this.fetchBlueprints(); // Refresh to get updated sections with nested rules
        },
        error: (err) => { console.error(err); this.submittingRule = false; }
      });
  }

  openQuestionPicker(sectionUuid: string) {
    this.activeSectionUuid = sectionUuid;
    
    // Pre-fill selected questions from existing data
    this.selectedQuestionUuids.clear();
    const section = this.sections.find(s => s.uuid === sectionUuid);
    if (section?.relationships?.sectionQuestions) {
      section.relationships.sectionQuestions.forEach((sq: any) => {
        if (sq.relationships?.question?.uuid) {
          this.selectedQuestionUuids.add(sq.relationships.question.uuid);
        }
      });
    }

    this.isQuestionPickerOpen = true;
    this.questionPickerForm.reset({ question_bank_uuid: null, tag_uuid: null });
    this.fetchQuestionsForPicker();
  }

  fetchQuestionsForPicker() {
    this.loadingQuestions = true;
    const filter = this.questionPickerForm.value;
    let url = `${environment.apiUrl}/assessment/questions?per_page=100`;
    
    if (filter.question_bank_uuid) url += `&question_bank_uuid=${filter.question_bank_uuid}`;
    if (filter.tag_uuid) url += `&tag_uuid=${filter.tag_uuid}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        // Handle paginated responses where the array is inside res.data.data
        this.availableQuestions = res.data?.data || res.data || res;
        this.loadingQuestions = false;
      },
      error: (err) => { console.error(err); this.loadingQuestions = false; }
    });
  }

  toggleQuestionSelection(uuid: string) {
    if (this.selectedQuestionUuids.has(uuid)) {
      this.selectedQuestionUuids.delete(uuid);
    } else {
      this.selectedQuestionUuids.add(uuid);
    }
  }

  submitQuestions() {
    if (!this.activeSectionUuid) return;
    
    this.submittingQuestions = true;
    const payload = {
      question_uuids: Array.from(this.selectedQuestionUuids)
    };

    this.http.post(`${environment.apiUrl}/assessment/sections/${this.activeSectionUuid}/questions`, payload)
      .subscribe({
        next: () => {
          this.submittingQuestions = false;
          this.isQuestionPickerOpen = false;
          this.fetchBlueprints(); // Refresh to get updated section questions
        },
        error: (err) => { console.error(err); this.submittingQuestions = false; }
      });
  }
}