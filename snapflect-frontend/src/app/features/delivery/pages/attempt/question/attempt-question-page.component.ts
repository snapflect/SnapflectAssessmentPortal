import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuillEditorComponent } from 'ngx-quill';
import { AssessmentRunnerService, QuestionState } from '../../../services/assessment-runner.service';
import { environment } from '../../../../../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-attempt-question-page',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillEditorComponent],
  template: `
    <div class="h-full flex flex-col bg-slate-900">
      
      <!-- Top Bar -->
      <header class="flex-none bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center z-10 shadow-md">
        <div>
          <h1 class="text-main font-bold text-lg leading-tight">{{ runner.attempt()?.title || 'Assessment' }}</h1>
          <p class="text-muted text-xs mt-0.5">Attempt in progress</p>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center gap-3">
          <div class="bg-input-bg border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
               [ngClass]="{'border-red-500/50 text-red-400': timeRemaining() !== null && timeRemaining()! < 300, 'text-emerald-400': timeRemaining() === null || timeRemaining()! >= 300}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-mono font-bold text-lg tracking-wider">{{ formattedTime }}</span>
          </div>
          
          <button (click)="goToSummary()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-main text-sm font-medium rounded-lg transition-colors border border-slate-600 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Overview
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div class="max-w-4xl mx-auto w-full">
          
          <div *ngIf="loading" class="flex justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div *ngIf="!loading && question" class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <!-- Question Header -->
            <div class="bg-slate-800/50 border-b border-slate-700 p-6 flex justify-between items-start">
              <div class="flex gap-4">
                <div class="w-10 h-10 bg-brand/20 border border-brand/30 rounded-lg flex items-center justify-center text-brand-light font-bold flex-none">
                  {{ currentSequenceNumber }}
                </div>
                <div class="mt-2 text-lg text-main font-medium quill-content" [innerHTML]="question.attributes?.stem_text"></div>
              </div>
              <div class="flex-none">
                <span class="px-2.5 py-1 bg-slate-700/50 text-muted text-xs font-semibold rounded-md border border-slate-600">
                  {{ question.attributes?.type }}
                </span>
              </div>
            </div>

            <!-- Answer Area -->
            <div class="p-6 bg-input-bg">
              
              <!-- Multiple Choice / Single Choice -->
              <div *ngIf="question.attributes?.type === 'MULTIPLE_CHOICE' || question.attributes?.type === 'SINGLE_CHOICE'" class="space-y-3">
                <label *ngFor="let opt of question.relationships?.options" 
                       class="relative flex items-center p-4 border rounded-xl cursor-pointer transition-all"
                       [ngClass]="isOptionSelected(opt.uuid) ? 'border-brand bg-brand/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'">
                  
                  <div class="flex items-center h-5 mr-4">
                    <input *ngIf="question.attributes?.type === 'SINGLE_CHOICE'" 
                           type="radio" 
                           [name]="question.uuid" 
                           [value]="opt.uuid"
                           [checked]="isOptionSelected(opt.uuid)"
                           (change)="toggleOption(opt.uuid, false)"
                           class="w-5 h-5 border-slate-500 text-brand bg-slate-900 focus:ring-brand focus:ring-offset-slate-900">
                           
                    <input *ngIf="question.attributes?.type === 'MULTIPLE_CHOICE'" 
                           type="checkbox" 
                           [value]="opt.uuid"
                           [checked]="isOptionSelected(opt.uuid)"
                           (change)="toggleOption(opt.uuid, true)"
                           class="w-5 h-5 rounded border-slate-500 text-brand bg-slate-900 focus:ring-brand focus:ring-offset-slate-900">
                  </div>
                  
                  <div class="text-muted" [innerHTML]="opt.attributes?.option_text"></div>
                </label>
              </div>

              <!-- Essay -->
              <div *ngIf="question.attributes?.type === 'ESSAY'" class="bg-white rounded-lg overflow-hidden">
                <quill-editor 
                  [(ngModel)]="essayAnswer" 
                  (ngModelChange)="onEssayChange($event)"
                  [styles]="{height: '250px'}"
                  placeholder="Type your answer here..."
                  [modules]="{ toolbar: [['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['clean']] }">
                </quill-editor>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      <!-- Footer Bar -->
      <footer class="flex-none bg-slate-800 border-t border-slate-700 p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        <div class="flex items-center gap-4">
          <button (click)="navigate('previous')" [disabled]="navigating || loading" class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-main font-medium rounded-lg transition-colors border border-slate-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            Previous
          </button>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 mr-4" *ngIf="saving">
            <svg class="animate-spin h-4 w-4 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-xs text-muted">Saving...</span>
          </div>
        
          <button (click)="toggleFlag()" [disabled]="!question" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-muted font-medium rounded-lg transition-colors border flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  [ngClass]="isFlagged ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-slate-600'">
            <svg class="w-4 h-4" [attr.fill]="isFlagged ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path>
            </svg>
            {{ isFlagged ? 'Flagged' : 'Flag for Review' }}
          </button>
          
          <button (click)="navigate('next')" [disabled]="navigating || loading" class="px-8 py-2.5 bg-brand hover:bg-brand-light text-main font-bold rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </footer>
      
    </div>
  `
})
export class AttemptQuestionPageComponent implements OnInit, OnDestroy {
  public runner = inject(AssessmentRunnerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  attemptUuid: string = '';
  questionUuidParam: string | null = null;
  
  question: any = null;
  loading = true;
  navigating = false;
  saving = false;
  
  // Local Answer State
  selectedOptions: string[] = [];
  essayAnswer: string = '';
  isFlagged = false;
  currentSequenceNumber = 1;

  // Debounced Auto-save for Essay
  private essayChange$ = new Subject<string>();
  private sub = new Subscription();

  get formattedTime(): string {
    const s = this.timeRemaining();
    if (s === null) return '--:--';
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  timeRemaining() {
    return this.runner.timeRemainingSeconds();
  }

  ngOnInit() {
    this.attemptUuid = this.route.snapshot.paramMap.get('uuid') || '';
    
    // Check query params for a specific question to jump to
    this.route.queryParams.subscribe(params => {
      this.questionUuidParam = params['q'] || null;
      
      // Load attempt details if not present in service
      if (!this.runner.attempt() || this.runner.attempt()?.uuid !== this.attemptUuid) {
        this.runner.loadAttempt(this.attemptUuid).subscribe(() => this.loadQuestion());
      } else {
        this.loadQuestion();
      }
    });

    // Auto save essay every 2 seconds of typing
    this.sub.add(
      this.essayChange$.pipe(debounceTime(2000)).subscribe(val => {
        if (this.question) {
          this.saveCurrentAnswer();
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    // Save before destroying just in case
    if (this.question && (this.selectedOptions.length > 0 || this.essayAnswer)) {
      this.saveCurrentAnswer();
    }
  }

  loadQuestion() {
    this.loading = true;
    
    let fetchReq;
    if (this.questionUuidParam) {
      // Direct jump via Jump Endpoint
      fetchReq = this.http.get<any>(`${environment.apiUrl}/delivery/attempts/${this.attemptUuid}/questions/${this.questionUuidParam}`);
    } else {
      // Just load the 'next' which handles starting at Q1
      fetchReq = this.runner.navigateQuestion(this.attemptUuid, 'next');
    }

    fetchReq.subscribe({
      next: (res) => {
        const data = res.data || res;
        this.question = data.question || data; 
        
        // Populate local state based on backend response which should include any existing candidate answer
        this.selectedOptions = this.question.attributes?.candidate_answer?.selected_options || [];
        this.essayAnswer = this.question.attributes?.candidate_answer?.text_response || '';
        this.isFlagged = !!this.question.attributes?.is_flagged;
        
        // Mock sequence number if API doesn't provide it directly in standard wrapper
        this.currentSequenceNumber = data.sequence_number || this.currentSequenceNumber;
        
        this.loading = false;
        this.navigating = false;
        
        // Pre-fetch all questions for summary matrix if we haven't
        if (this.runner.questionMap().length === 0) {
          this.runner.loadQuestions(this.attemptUuid).subscribe();
        }
      },
      error: (err) => {
        console.error('Error loading question:', err);
        // If there are no more questions, go to summary
        if (err.status === 404 || err.error?.message?.includes('No more questions')) {
           this.goToSummary();
        } else {
          this.loading = false;
          this.navigating = false;
        }
      }
    });
  }

  isOptionSelected(uuid: string): boolean {
    return this.selectedOptions.includes(uuid);
  }

  toggleOption(uuid: string, isMulti: boolean) {
    if (isMulti) {
      const idx = this.selectedOptions.indexOf(uuid);
      if (idx > -1) {
        this.selectedOptions.splice(idx, 1);
      } else {
        this.selectedOptions.push(uuid);
      }
    } else {
      this.selectedOptions = [uuid];
    }
    
    this.saveCurrentAnswer();
  }

  onEssayChange(val: string) {
    this.essayChange$.next(val);
  }

  toggleFlag() {
    if (!this.question) return;
    const newFlagState = !this.isFlagged;
    
    this.runner.toggleFlag(this.question.uuid, newFlagState).subscribe({
      next: () => {
        this.isFlagged = newFlagState;
      }
    });
  }

  saveCurrentAnswer() {
    if (!this.question) return;
    this.saving = true;

    const payload = {
      selected_options: this.selectedOptions,
      text_response: this.question.attributes?.type === 'ESSAY' ? this.essayAnswer : null
    };

    this.runner.saveAnswer(this.attemptUuid, this.question.uuid, payload).subscribe({
      next: () => { this.saving = false; },
      error: () => { this.saving = false; }
    });
  }

  navigate(direction: 'next' | 'previous') {
    this.navigating = true;
    
    // Save before navigating (ensure latest is flushed)
    this.saveCurrentAnswer();

    this.runner.navigateQuestion(this.attemptUuid, direction, this.question?.uuid).subscribe({
      next: (res) => {
        const data = res.data || res;
        
        // If the backend returns null or a specific flag indicating end of test
        if (!data || !data.question) {
          this.goToSummary();
        } else {
          // Remove query param to clean URL and just use the state
          this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
          
          this.question = data.question;
          this.selectedOptions = this.question.attributes?.candidate_answer?.selected_options || [];
          this.essayAnswer = this.question.attributes?.candidate_answer?.text_response || '';
          this.isFlagged = !!this.question.attributes?.is_flagged;
          this.currentSequenceNumber = data.sequence_number || (direction === 'next' ? this.currentSequenceNumber + 1 : this.currentSequenceNumber - 1);
          
          this.navigating = false;
        }
      },
      error: (err) => {
        if (err.status === 404 || err.error?.message?.includes('No more questions')) {
          this.goToSummary();
        }
        this.navigating = false;
      }
    });
  }

  goToSummary() {
    this.router.navigate(['/delivery/attempts', this.attemptUuid, 'summary']);
  }
}