import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryFacade } from '../../../facades/delivery.facade';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormatTimePipe } from '../../../../../shared/pipes/format-time.pipe';

@Component({
  selector: 'app-attempt-summary-page',
  standalone: true,
  imports: [CommonModule, FormatTimePipe],
  template: `
    <div class="h-full flex flex-col bg-slate-900/50 p-6 overflow-y-auto">
      
      <div class="max-w-4xl mx-auto w-full">
        
        <!-- Header -->
        <div class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-bold text-main mb-2">Review & Submit</h1>
            <p class="text-muted">Review your answers before final submission.</p>
          </div>
          
          <!-- Timer -->
          <div class="bg-input-bg border border-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-3"
               [ngClass]="{'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]': timeRemaining() !== null && timeRemaining()! < 300, 'text-emerald-400': timeRemaining() !== null && timeRemaining()! >= 300, 'text-slate-400': timeRemaining() === null}">
            <!-- Countdown icon -->
            <svg *ngIf="timeRemaining() !== null" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Stopwatch icon (untimed) -->
            <svg *ngIf="timeRemaining() === null" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"></path>
            </svg>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold leading-none mb-1">
                {{ timeRemaining() !== null ? 'Time Left' : 'Elapsed' }}
              </span>
              <span class="font-mono font-bold text-xl leading-none">{{ (timeRemaining() !== null ? timeRemaining() : facade.attemptStore.elapsedSeconds()) | formatTime }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="flex justify-center py-20">
          <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div *ngIf="!loading">
          
          <!-- Summary Stats -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-main">{{ questions.length }}</div>
                <div class="text-sm text-muted mt-1">Total Questions</div>
              </div>
              <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-emerald-400">{{ answeredCount }}</div>
                <div class="text-sm text-muted mt-1">Answered</div>
              </div>
              <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold" [ngClass]="unansweredCount > 0 ? 'text-amber-400' : 'text-muted'">{{ unansweredCount }}</div>
                <div class="text-sm text-muted mt-1">Unanswered</div>
              </div>
              <div class="w-12 h-12 rounded-full flex items-center justify-center" [ngClass]="unansweredCount > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-700'">
                <svg class="w-6 h-6" [ngClass]="unansweredCount > 0 ? 'text-amber-400' : 'text-muted'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <!-- Question Grid -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 shadow-xl">
            <h3 class="text-main font-medium mb-6 flex justify-between items-center">
              Question Map
              
              <!-- Legend -->
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50"></div> <span class="text-muted">Answered</span></div>
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-slate-700 border border-slate-600"></div> <span class="text-muted">Unanswered</span></div>
                <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/50 relative overflow-hidden">
                  <div class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rotate-45"></div>
                </div> <span class="text-muted">Flagged</span></div>
              </div>
            </h3>

            <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              <button *ngFor="let q of questions; let i = index" 
                      (click)="jumpToQuestion(q.uuid)"
                      class="relative w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105"
                      [ngClass]="{
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20': q.is_answered && !q.is_flagged,
                        'bg-slate-700 text-muted border border-slate-600 hover:bg-slate-600': !q.is_answered && !q.is_flagged,
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20': q.is_flagged
                      }">
                {{ i + 1 }}
                
                <!-- Flag marker -->
                <div *ngIf="q.is_flagged" class="absolute -top-1 -right-1">
                  <svg class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center">
            <button (click)="returnToTest()" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-main font-medium rounded-lg transition-colors border border-slate-600">
              Return to Test
            </button>
            
            <button (click)="initiateSubmit()" 
                    class="px-8 py-3 bg-brand hover:bg-brand-light text-main font-bold rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center gap-2">
              Submit Final Answers
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
          
        </div>
      </div>
      
      <!-- Submission Confirmation Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          
          <div *ngIf="submitting" class="absolute inset-0 bg-slate-800/80 backdrop-blur flex flex-col items-center justify-center z-10">
            <svg class="animate-spin h-10 w-10 text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-main font-medium">Submitting assessment...</p>
          </div>

          <div class="mb-6 flex justify-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center"
                 [ngClass]="unansweredCount > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-brand/20 text-brand-light'">
              <svg *ngIf="unansweredCount === 0" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <svg *ngIf="unansweredCount > 0" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-main text-center mb-2">Confirm Submission</h2>
          
          <p class="text-muted text-center mb-6">
            <ng-container *ngIf="unansweredCount === 0 && flaggedCount === 0">
              You have answered all questions. Are you sure you want to submit your assessment? This action cannot be undone.
            </ng-container>
            <ng-container *ngIf="unansweredCount > 0 || flaggedCount > 0">
              You have <strong *ngIf="unansweredCount > 0" class="text-amber-400">{{ unansweredCount }} unanswered</strong> 
              <span *ngIf="unansweredCount > 0 && flaggedCount > 0"> and </span> 
              <strong *ngIf="flaggedCount > 0" class="text-amber-400">{{ flaggedCount }} flagged</strong> questions remaining. 
              Are you sure you want to submit?
            </ng-container>
          </p>
          
          <div class="flex gap-3">
            <button (click)="showModal = false" class="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-main rounded-lg transition-colors border border-slate-600">
              Cancel
            </button>
            <button (click)="confirmSubmit()" class="flex-1 px-4 py-2.5 bg-brand hover:bg-brand-light text-main font-bold rounded-lg transition-colors shadow-lg shadow-brand/20">
              Submit Now
            </button>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class AttemptSummaryPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public facade = inject(DeliveryFacade);
  private toastService = inject(ToastService);

  attemptUuid = '';
  loading = true;
  showModal = false;
  submitting = false;

  get questions() { return this.facade.attemptStore.questionMap(); }
  get answeredCount() { return this.questions.filter(q => q.is_answered).length; }
  get unansweredCount() { return this.questions.filter(q => !q.is_answered).length; }
  get flaggedCount() { return this.questions.filter(q => q.is_flagged).length; }

  timeRemaining() {
    return this.facade.attemptStore.timeRemainingSeconds();
  }

  ngOnInit() {
    this.attemptUuid = this.route.snapshot.paramMap.get('uuid') || '';

    // Load state if not loaded
    if (!this.facade.attemptStore.currentAttempt() || this.facade.attemptStore.currentAttempt()?.uuid !== this.attemptUuid) {
      this.facade.loadAttempt(this.attemptUuid).subscribe(() => this.loadQuestions());
    } else {
      this.loadQuestions();
    }
  }

  loadQuestions() {
    this.facade.loadQuestions(this.attemptUuid).subscribe({
      next: () => { this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  jumpToQuestion(uuid: string) {
    this.router.navigate(['/delivery/attempts', this.attemptUuid], { queryParams: { q: uuid } });
  }

  returnToTest() {
    // Jump to first unanswered, or just go to question page
    const firstUnanswered = this.questions.find(q => !q.is_answered);
    if (firstUnanswered) {
      this.jumpToQuestion(firstUnanswered.uuid);
    } else {
      this.router.navigate(['/delivery/attempts', this.attemptUuid]);
    }
  }

  initiateSubmit() {
    this.showModal = true;
  }

  confirmSubmit() {
    this.submitting = true;
    this.facade.submitAttempt(this.attemptUuid).subscribe({
      next: () => {
        this.submitting = false;
        this.showModal = false;
        this.router.navigate(['/delivery/attempts', this.attemptUuid, 'submission']);
      },
      error: (err) => {
        console.error('Submit failed', err);
        this.submitting = false;
        this.showModal = false;
        this.toastService.error('Submission Failed', 'Failed to submit assessment. Please try again.');
      }
    });
  }
}