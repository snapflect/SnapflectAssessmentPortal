import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryFacade } from '../../../facades/delivery.facade';
import { DeliveryApiService } from '../../../../../core/api/delivery-api.service';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, catchError, filter, takeWhile, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-attempt-submission-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center bg-slate-900/50 p-6 overflow-y-auto">
      
      <div class="glass-card max-w-2xl w-full border-t-4 border-t-emerald-500 rounded-xl overflow-hidden shadow-2xl relative">
        
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-5 pointer-events-none" 
             style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;">
        </div>

        <div class="p-10 relative z-10 text-center border-b border-slate-700/50">
          <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 relative">
            <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Confetti dots -->
            <div class="absolute -top-4 -left-4 w-2 h-2 bg-rose-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="absolute top-8 -right-6 w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
            <div class="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          
          <h1 class="text-3xl font-bold text-main mb-2">Assessment Submitted!</h1>
          <p class="text-muted max-w-md mx-auto">
            Your responses have been successfully recorded and securely saved. Great job completing the assessment.
          </p>
        </div>
        
        <!-- Score Preview Panel -->
        <div class="bg-slate-800/50 p-8">
           <h3 class="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Submission Details</h3>
           
           <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              
              <!-- Circular Score -->
              <div class="relative w-32 h-32 flex items-center justify-center">
                 <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path class="text-slate-700" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="text-emerald-500 drop-shadow-md" [attr.stroke-dasharray]="(isGradingComplete ? scorePercentage : completionPercentage) + ', 100'" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 </svg>
                 <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-white">{{ isGradingComplete ? scorePercentage : completionPercentage }}%</span>
                    <span class="text-[10px] text-slate-400 uppercase">{{ isGradingComplete ? 'Final Score' : 'Completed' }}</span>
                 </div>
              </div>
              
              <!-- Breakdown -->
              <div class="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                 <div>
                    <div class="flex justify-between text-sm mb-1">
                       <span class="text-slate-300">Answered Questions</span>
                       <span class="text-emerald-400 font-bold">{{ answeredQuestions }} / {{ totalQuestions }}</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                       <div class="bg-emerald-500 h-full" [style.width]="completionPercentage + '%'"></div>
                    </div>
                 </div>
                 
                 <div *ngIf="isConnectionError" class="mt-2 text-xs text-red-400 flex items-start gap-2 bg-red-500/10 p-3 rounded border border-red-500/20">
                    <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Connection lost. Trying to reconnect...</span>
                 </div>
                 
                 <div *ngIf="!isGradingComplete && !isGradingDelayed && !isConnectionError" class="mt-2 text-xs text-amber-500 flex items-start gap-2 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                    <svg class="w-4 h-4 shrink-0 mt-0.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span>Calculating your final score in the background...</span>
                 </div>

                 <div *ngIf="!isGradingComplete && isGradingDelayed" class="mt-2 text-xs text-brand-light flex items-start gap-2 bg-brand/10 p-3 rounded border border-brand/20">
                    <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Grading is taking longer than expected. You will be notified when results are ready.</span>
                 </div>

                 <div *ngIf="isGradingComplete" class="mt-2 text-xs text-emerald-400 flex items-start gap-2 bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
                    <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Grading complete! You achieved {{ scorePercentage }}%. Status: <span class="font-bold">{{ passFailStatus }}</span></span>
                 </div>
              </div>
           </div>
        </div>

        <!-- Actions -->
        <div class="p-6 bg-slate-900 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-center">
          <button (click)="returnToDashboard()" 
                  class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-main font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Candidate Dashboard
          </button>
        </div>

      </div>
      
    </div>
  `
})
export class AttemptSubmissionPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public facade = inject(DeliveryFacade);
  private api = inject(DeliveryApiService);
  
  private sub = new Subscription();
  private attemptUuid = '';
  
  isGradingComplete = false;
  isGradingDelayed = false;
  isConnectionError = false;
  scorePercentage = 0;
  passFailStatus = '';

  get submissionResult() {
    return this.facade.attemptStore.submissionResult();
  }

  get completionPercentage() {
    if (this.submissionResult?.completion_percentage !== undefined) return this.submissionResult.completion_percentage;
    const answered = this.answeredQuestions;
    const total = this.totalQuestions;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  }

  get answeredQuestions() {
    if (this.submissionResult?.total_answered !== undefined) return this.submissionResult.total_answered;
    return this.facade.attemptStore.questionMap().filter(q => q.is_answered).length;
  }

  get totalQuestions() {
    if (this.submissionResult?.total_questions !== undefined) return this.submissionResult.total_questions;
    return this.facade.attemptStore.questionMap().length;
  }

  ngOnInit() {
    this.attemptUuid = this.route.snapshot.paramMap.get('uuid') || '';
    
    // Poll for grading result every 3 seconds
    this.sub.add(
      timer(0, 3000)
        .pipe(
          take(10), // Max 10 polls
          takeWhile(() => !this.isGradingComplete),
          switchMap(() => this.api.getAttemptResult(this.attemptUuid).pipe(
            tap(() => this.isConnectionError = false),
            catchError((err) => {
              if (err.status !== 404) {
                this.isConnectionError = true;
              }
              return of(null);
            }) // Ignore errors while pending, but show connection error
          ))
        )
        .subscribe({
          next: (res) => {
            if (res?.success && res?.data?.status === 'SCORED') {
              this.isGradingComplete = true;
              this.scorePercentage = res.data.overall_percentage;
              this.passFailStatus = res.data.pass_fail_status;
            }
          },
          complete: () => {
             if (!this.isGradingComplete) {
                this.isGradingDelayed = true;
             }
          }
        })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  returnToDashboard() {
    this.router.navigate(['/delivery/dashboard']);
  }
}