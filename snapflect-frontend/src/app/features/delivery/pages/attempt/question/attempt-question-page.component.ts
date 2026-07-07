import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { FormatTimePipe } from '../../../../../shared/pipes/format-time.pipe';
import { DeliveryFacade } from '../../../facades/delivery.facade';
import { environment } from '../../../../../../environments/environment';
import { Subject, Subscription, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-attempt-question-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatTimePipe],
  template: `
    <div class="h-full flex flex-col bg-slate-900">
      
      <!-- Paused Overlay -->
      <div *ngIf="sessionPaused" class="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
        <div class="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30">
          <svg class="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">Session Paused</h2>
        <p class="text-slate-300 text-lg max-w-md">Your assessment has been temporarily paused by the Proctor. Please wait for further instructions.</p>
      </div>

      <!-- Top Bar -->
      <header class="flex-none bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center z-10 shadow-md">
        <div class="flex items-center gap-3">
          <button (click)="goBack()" class="btn-ghost !p-2 text-slate-400 hover:text-white" title="Back to Assessments">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-main font-bold text-lg leading-tight">{{ facade.attemptStore.currentAttempt()?.title || 'Assessment' }}</h1>
            <p class="text-muted text-xs mt-0.5">Attempt in progress</p>
          </div>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center gap-3">
          <div class="bg-input-bg border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
               [ngClass]="{'border-red-500/50 text-red-400': timeRemaining() !== null && timeRemaining()! < 300, 'text-emerald-400': timeRemaining() !== null && timeRemaining()! >= 300, 'text-slate-400': timeRemaining() === null}">
            <!-- Countdown icon -->
            <svg *ngIf="timeRemaining() !== null" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Stopwatch icon (untimed) -->
            <svg *ngIf="timeRemaining() === null" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"></path>
            </svg>
            <span class="font-mono font-bold text-lg tracking-wider">{{ (timeRemaining() !== null ? timeRemaining() : facade.attemptStore.elapsedSeconds()) | formatTime }}</span>
            <span *ngIf="timeRemaining() === null" class="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Elapsed</span>
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

          <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl mt-4 max-w-2xl mx-auto text-center shadow-lg">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 class="text-xl font-bold mb-2">Something went wrong</h3>
            <p>{{ error }}</p>
            <button (click)="loadQuestion()" class="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-main rounded-lg border border-slate-600 transition-colors">
              Try Again
            </button>
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
              <div *ngIf="question.attributes?.type === 'MULTIPLE_CHOICE' || question.attributes?.type === 'SINGLE_CHOICE' || question.attributes?.type === 'TRUE_FALSE'" class="space-y-3">
                <label *ngFor="let opt of question.relationships?.options" 
                       class="relative flex items-center p-4 border rounded-xl cursor-pointer transition-all"
                       [ngClass]="isOptionSelected(opt.uuid) ? 'border-brand bg-brand/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'">
                  
                  <div class="flex items-center h-5 mr-4">
                    <input *ngIf="question.attributes?.type === 'SINGLE_CHOICE' || question.attributes?.type === 'TRUE_FALSE'" 
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
              <div *ngIf="question.attributes?.type === 'ESSAY'">
                <textarea 
                  [(ngModel)]="essayAnswer" 
                  (ngModelChange)="onEssayChange($event)"
                  rows="10"
                  class="w-full bg-slate-900 border border-slate-700 text-main rounded-xl p-4 focus:ring-2 focus:ring-brand focus:border-brand placeholder-slate-500 resize-y transition-all"
                  placeholder="Type your essay answer here...">
                </textarea>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      <!-- Footer Bar -->
      <footer class="flex-none bg-slate-800 border-t border-slate-700 p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        <div class="flex items-center gap-4">
          <button *ngIf="currentSequenceNumber > 1" (click)="navigate('previous')" [disabled]="navigating || loading" class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-main font-medium rounded-lg transition-colors border border-slate-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
  public facade = inject(DeliveryFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private confirmService = inject(ConfirmService);
  private toast = inject(ToastService);

  attemptUuid: string = '';
  questionUuidParam: string | null = null;
  
  question: any = null;
  loading = true;
  navigating = false;
  saving = false;
  error: string | null = null;
  
  // Local Answer State
  selectedOptions: string[] = [];
  essayAnswer: string = '';
  isFlagged = false;
  currentSequenceNumber = 1;
  sessionPaused = false;

  // Debounced Auto-save for Essay
  private essayChange$ = new Subject<string>();
  private sub = new Subscription();

  timeRemaining() {
    return this.facade.attemptStore.timeRemainingSeconds();
  }

  ngOnInit() {
    this.attemptUuid = this.route.snapshot.paramMap.get('uuid') || '';
    
    // Check query params for a specific question to jump to
    this.route.queryParams.subscribe(params => {
      this.questionUuidParam = params['q'] || null;
      
      // Load attempt details if not present in service
      if (!this.facade.attemptStore.currentAttempt() || this.facade.attemptStore.currentAttempt()?.uuid !== this.attemptUuid) {
        this.facade.loadAttempt(this.attemptUuid).subscribe(() => this.loadQuestion());
      } else {
        this.loadQuestion();
      }
    });

    // Auto save essay every 2 seconds of typing
    this.sub.add(
      this.essayChange$.pipe(debounceTime(2000)).subscribe(val => {
        if (this.question) {
          this.saveCurrentAnswer().subscribe();
        }
      })
    );

    // Polling engine for session status
    this.sub.add(
      interval(10000).subscribe(() => {
        const clientTimestamp = Date.now();
        this.http.get<any>(`${environment.apiUrl}/delivery/attempts/${this.attemptUuid}/progress?client_timestamp=${clientTimestamp}`).subscribe({
          next: (res) => {
            const status = res.data?.attributes?.session_status;
            if (status === 'TERMINATED') {
              this.toast.error('Session Terminated', 'Your session was terminated by the Proctor.', 10000);
              this.goToSummary();
            } else if (status === 'PAUSED') {
              this.sessionPaused = true;
            } else {
              this.sessionPaused = false;
            }
          }
        });
      })
    );
  }

  async goBack() {
    const confirmed = await this.confirmService.confirm({
      title: 'Leave Assessment?',
      message: 'Are you sure you want to leave this assessment? Your progress so far is automatically saved.',
      confirmText: 'Leave',
      cancelText: 'Cancel',
      variant: 'warning'
    });
    
    if (confirmed) {
      this.router.navigate(['/delivery/dashboard']);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    // Save before destroying just in case
    if (this.question && (this.selectedOptions.length > 0 || this.essayAnswer)) {
      this.saveCurrentAnswer().subscribe();
    }
  }

  loadQuestion() {
    this.loading = true;
    this.error = null;
    
    let fetchReq;
    if (this.questionUuidParam) {
      // Direct jump via Jump Endpoint
      fetchReq = this.facade.navigateQuestion(this.attemptUuid, 'jump', this.questionUuidParam);
    } else {
      // Just load the 'next' which handles starting at Q1
      fetchReq = this.facade.navigateQuestion(this.attemptUuid, 'next');
    }

    fetchReq.subscribe({
      next: (res) => {
        const data = res.data || res;
        this.question = data.question || data; 
        
        const ans = this.question.attributes?.candidate_answer;
        if (ans) {
          this.selectedOptions = (ans.selected_options && ans.selected_options.length > 0) ? ans.selected_options : [];
          this.essayAnswer = this.stripHtml(ans.text_response || '');
        } else {
          this.selectedOptions = [];
          this.essayAnswer = '';
        }
        this.isFlagged = !!this.question.attributes?.is_flagged;
        
        // Mock sequence number if API doesn't provide it directly in standard wrapper
        this.currentSequenceNumber = data.sequence_number || this.currentSequenceNumber;
        
        this.loading = false;
        this.navigating = false;
        
        // Pre-fetch all questions for summary matrix if we haven't
        if (this.facade.attemptStore.questionMap().length === 0) {
          this.facade.loadQuestions(this.attemptUuid).subscribe();
        }
      },
      error: (err) => {
        console.error('Error loading question:', err);
        // If there are no more questions, go to summary
        if (err.status === 404 || err.error?.detail?.includes('No more questions') || err.error?.message?.includes('No more questions')) {
           this.goToSummary();
        } else {
          this.error = 'Failed to load question. Please check your connection and try again.';
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
    
    this.saveCurrentAnswer().subscribe();
  }

  onEssayChange(val: string) {
    this.essayChange$.next(val);
  }

  toggleFlag() {
    if (!this.question) return;
    const newFlagState = !this.isFlagged;
    
    this.facade.toggleFlag(this.attemptUuid, this.question.uuid, newFlagState).subscribe({
      next: () => {
        this.isFlagged = newFlagState;
      }
    });
  }

  saveCurrentAnswer() {
    if (!this.question) return of(null);
    this.saving = true;

    const answerType = this.question.attributes?.type;
    const payload: any = {
      answer_type: answerType
    };

    if (answerType === 'ESSAY' || answerType === 'SHORT_TEXT' || answerType === 'LONG_TEXT') {
      payload.text_answer = this.essayAnswer;
    } else if (answerType === 'SINGLE_CHOICE' || answerType === 'MCQ' || answerType === 'TRUE_FALSE') {
      payload.selected_option_uuid = this.selectedOptions[0] || null;
    } else if (answerType === 'MULTIPLE_CHOICE' || answerType === 'MRQ') {
      payload.selected_option_uuids_json = this.selectedOptions;
    }

    const attemptUuid = this.attemptUuid;
    if (attemptUuid && this.question.uuid) {
      return this.facade.saveAnswer(attemptUuid, this.question.uuid, payload).pipe(
        tap({
          next: () => { this.saving = false; },
          error: () => { this.saving = false; },
          complete: () => { this.saving = false; }
        })
      );
    }
    return of(null);
  }

  navigate(direction: 'next' | 'previous') {
    this.navigating = true;
    const currentUuid = this.question?.uuid;
    
    // Save before navigating (ensure latest is flushed)
    this.saveCurrentAnswer().pipe(
      switchMap(() => this.facade.navigateQuestion(this.attemptUuid, direction, currentUuid))
    ).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        
        // If the backend returns null or a specific flag indicating end of test
        if (!data || !data.question) {
          this.goToSummary();
        } else {
          // Remove query param to clean URL and just use the state
          this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge', replaceUrl: true });
          
          this.question = data.question;
          const navAns = this.question.attributes?.candidate_answer;
          if (navAns) {
            this.selectedOptions = (navAns.selected_options && navAns.selected_options.length > 0) ? navAns.selected_options : [];
            this.essayAnswer = this.stripHtml(navAns.text_response || '');
          } else {
            this.selectedOptions = [];
            this.essayAnswer = '';
          }
          this.isFlagged = !!this.question.attributes?.is_flagged;
          this.currentSequenceNumber = data.sequence_number || (direction === 'next' ? this.currentSequenceNumber + 1 : this.currentSequenceNumber - 1);
          
          this.navigating = false;
        }
      },
      error: (err: any) => {
        if (err.status === 404 || err.error?.detail?.includes('No more questions') || err.error?.message?.includes('No more questions')) {
          this.goToSummary();
        }
        this.navigating = false;
      }
    });
  }

  goToSummary() {
    this.router.navigate(['/delivery/attempts', this.attemptUuid, 'summary']);
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
}