import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-attempt-submission-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center bg-slate-900/50 p-6">
      
      <div class="glass-card max-w-md w-full border-t-4 border-t-emerald-500 rounded-xl overflow-hidden shadow-2xl text-center p-10">
        
        <div class="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-white mb-2">Assessment Submitted</h1>
        
        <p class="text-slate-400 mb-8">
          Thank you! Your responses have been recorded successfully. 
          You can safely close this window or return to your dashboard.
        </p>

        <button (click)="returnToDashboard()" 
                class="w-full px-6 py-3.5 bg-brand hover:bg-brand-light text-white font-bold rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2">
          Return to Dashboard
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>

      </div>
      
    </div>
  `
})
export class AttemptSubmissionPageComponent {
  private router = inject(Router);

  returnToDashboard() {
    this.router.navigate(['/delivery/dashboard']);
  }
}