import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
           <h3 class="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Preliminary Results</h3>
           
           <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              
              <!-- Circular Score -->
              <div class="relative w-32 h-32 flex items-center justify-center">
                 <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path class="text-slate-700" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="text-emerald-500 drop-shadow-md" stroke-dasharray="82, 100" stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 </svg>
                 <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-white">82%</span>
                    <span class="text-[10px] text-slate-400 uppercase">Score</span>
                 </div>
              </div>
              
              <!-- Breakdown -->
              <div class="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                 <div>
                    <div class="flex justify-between text-sm mb-1">
                       <span class="text-slate-300">Technical Skills</span>
                       <span class="text-emerald-400 font-bold">90%</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                       <div class="bg-emerald-500 h-full w-[90%]"></div>
                    </div>
                 </div>
                 <div>
                    <div class="flex justify-between text-sm mb-1">
                       <span class="text-slate-300">Problem Solving</span>
                       <span class="text-amber-400 font-bold">75%</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                       <div class="bg-amber-400 h-full w-[75%]"></div>
                    </div>
                 </div>
                 <div class="mt-2 text-xs text-slate-500 flex items-start gap-2 bg-slate-800 p-3 rounded border border-slate-700">
                    <svg class="w-4 h-4 shrink-0 mt-0.5 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Final score is pending manual review of open-ended questions.</span>
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
          <button (click)="viewDetailedResults()" 
                  class="px-6 py-2.5 bg-brand hover:bg-brand-light text-main font-bold rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2">
            View Detailed Results
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>

      </div>
      
    </div>
  `
})
export class AttemptSubmissionPageComponent {
  private router = inject(Router);

  returnToDashboard() {
    this.router.navigate(['/delivery/dashboard']);
  }

  viewDetailedResults() {
    // Navigate to a mock result UUID for demonstration
    this.router.navigate(['/results', '12345678-1234-1234-1234-1234567890ab']);
  }
}