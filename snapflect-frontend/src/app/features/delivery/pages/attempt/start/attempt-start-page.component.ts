import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryFacade } from '../../../facades/delivery.facade';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-attempt-start-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dark-theme h-full flex flex-col items-center justify-center p-6 bg-page text-main">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center">
        <svg class="animate-spin h-10 w-10 text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-muted">Loading assessment details...</p>
      </div>

      <!-- Pre-flight Card -->
      <div *ngIf="!loading && sessionDetails" class="glass-card max-w-2xl w-full border-t-4 border-t-brand rounded-xl overflow-hidden shadow-2xl">
        <div class="p-8">
          
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand/30">
              <svg class="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-main mb-2">{{ sessionDetails.attributes?.name || 'Assessment Session' }}</h1>
            <p class="text-muted">Please review the instructions below before starting.</p>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-input-bg rounded-lg p-4 text-center border border-white/5">
              <div class="text-muted text-xs uppercase tracking-wider mb-1">Time Limit</div>
              <div class="text-main font-bold text-lg">{{ sessionDetails.attributes?.time_limit_minutes || 'Unlimited' }} <span *ngIf="sessionDetails.attributes?.time_limit_minutes" class="text-sm text-muted font-normal">min</span></div>
            </div>
            <div class="bg-input-bg rounded-lg p-4 text-center border border-white/5">
              <div class="text-muted text-xs uppercase tracking-wider mb-1">Questions</div>
              <div class="text-main font-bold text-lg">{{ sessionDetails.relationships?.assessment?.attributes?.total_questions || '?' }}</div>
            </div>
            <div class="bg-input-bg rounded-lg p-4 text-center border border-white/5">
              <div class="text-muted text-xs uppercase tracking-wider mb-1">Passing Score</div>
              <div class="text-success font-bold text-lg">{{ sessionDetails.relationships?.assessment?.attributes?.passing_score || 'N/A' }}%</div>
            </div>
            <div class="bg-input-bg rounded-lg p-4 text-center border border-white/5">
              <div class="text-muted text-xs uppercase tracking-wider mb-1">Proctoring</div>
              <div class="text-main font-bold text-lg">{{ sessionDetails.attributes?.proctoring_type === 'NONE' ? 'Standard' : 'Proctored' }}</div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="mb-8 bg-brand/5 border border-brand/10 rounded-lg p-5">
            <h3 class="text-main font-semibold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Important Instructions
            </h3>
            <ul class="space-y-2 text-sm text-muted list-disc pl-5">
              <li>Ensure you have a stable internet connection.</li>
              <li>Do not refresh the page or use the browser back button during the test.</li>
              <li>The timer will continue running even if you close the window.</li>
              <li>Your progress is auto-saved as you navigate between questions.</li>
              <li *ngIf="sessionDetails.attributes?.proctoring_type !== 'NONE'">This session is proctored. Your activity is being monitored.</li>
            </ul>
          </div>

          <!-- Agreement & Action -->
          <div class="flex flex-col items-center">
            <label class="flex items-center gap-3 cursor-pointer mb-6 group">
              <div class="relative flex items-center justify-center">
                <input type="checkbox" [(ngModel)]="agreed" class="peer appearance-none w-5 h-5 border-2 border-border-dark rounded cursor-pointer checked:border-brand checked:bg-brand transition-colors">
                <svg class="absolute w-3 h-3 text-main opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span class="text-muted group-hover:text-main transition-colors">I have read and agree to the instructions and honor code.</span>
            </label>

            <button 
              [disabled]="!agreed || launching"
              (click)="startAssessment()"
              class="w-full sm:w-auto px-10 py-3.5 bg-brand hover:bg-brand-light text-main font-bold rounded-lg shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              
              <svg *ngIf="launching" class="animate-spin h-5 w-5 text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              <span *ngIf="!launching">Start Assessment Now</span>
              <span *ngIf="launching">Initializing...</span>
              
              <svg *ngIf="!launching" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error" class="bg-danger/10 border border-danger/20 text-danger p-4 rounded-lg mt-4 max-w-lg text-center">
        {{ error }}
      </div>
    </div>
  `
})
export class AttemptStartPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private runner = inject(DeliveryFacade);
  private http = inject(HttpClient);

  sessionUuid: string | null = null;
  sessionDetails: any = null;
  
  loading = true;
  launching = false;
  agreed = false;
  error: string | null = null;

  ngOnInit() {
    this.sessionUuid = this.route.snapshot.queryParamMap.get('session');
    if (this.sessionUuid) {
      this.fetchSessionDetails(this.sessionUuid);
    } else {
      this.error = 'No session ID provided. Please launch the assessment from your dashboard.';
      this.loading = false;
    }
  }

  fetchSessionDetails(uuid: string) {
    // Fetch basic session details to show on the start screen
    this.http.get<any>(`${environment.apiUrl}/delivery/sessions/${uuid}?include=assessment`).subscribe({
      next: (res) => {
        this.sessionDetails = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load session details. The session may have expired or you may not have access.';
        this.loading = false;
      }
    });
  }

  startAssessment() {
    if (!this.sessionUuid || !this.agreed) return;

    this.launching = true;
    this.error = null;

    this.runner.launchSession(this.sessionUuid).subscribe({
      next: (attempt) => {
        // Attempt created successfully, navigate to the first question
        const uuid = attempt.data?.uuid || attempt.uuid;
        this.router.navigate(['/delivery/attempts', uuid]);
      },
      error: (err) => {
        console.error(err);
        // If it's already in progress, we might want to just resume
        if (err.status === 409 || (err.error && err.error.message?.includes('already in progress'))) {
          // This would ideally return the existing attempt ID, for now we mock it or show error
          this.error = err.error?.message || 'Assessment already in progress. Please return to dashboard and resume.';
        } else {
          this.error = 'Failed to start assessment. Please try again or contact support.';
        }
        this.launching = false;
      }
    });
  }
}