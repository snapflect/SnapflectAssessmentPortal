import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProctoringService, ProctoringSession } from '../../services/proctoring.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-proctoring-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col overflow-hidden bg-slate-900 text-slate-200">
      
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-slate-800 shrink-0 bg-slate-950">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            Live Proctoring Center
          </h2>
          <p class="text-slate-400 text-sm mt-1">Real-time monitoring of active assessment sessions.</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-slate-800 px-4 py-2 rounded-md flex items-center gap-3">
            <span class="text-sm text-slate-400">Active Candidates</span>
            <span class="text-xl font-bold text-emerald-400">{{ activeCandidatesCount }}</span>
          </div>
          <div class="bg-slate-800 px-4 py-2 rounded-md flex items-center gap-3">
            <span class="text-sm text-slate-400">Flagged Events</span>
            <span class="text-xl font-bold text-rose-400">{{ flaggedEventsCount }}</span>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          <ng-container *ngFor="let session of activeSessions">
            <div class="bg-slate-800 rounded-lg overflow-hidden border transition-colors shadow-lg relative group"
                 [ngClass]="{'border-rose-500/50': session.flagged, 'border-slate-700 hover:border-slate-600': !session.flagged}">
              
              <!-- Video Feed Placeholder -->
              <div class="aspect-video bg-slate-900 relative">
                <!-- Webcam View -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <!-- Screen Share PiP -->
                <div class="absolute bottom-2 right-2 w-1/3 aspect-video bg-slate-950 border border-slate-700 rounded overflow-hidden flex items-center justify-center opacity-80">
                   <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                
                <div *ngIf="session.flagged" class="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse">
                  Suspicious Activity
                </div>
                
                <div class="absolute top-2 right-2 flex gap-1">
                   <span class="w-2 h-2 rounded-full" [ngClass]="session.cameraOn ? 'bg-emerald-500' : 'bg-slate-500'"></span>
                   <span class="w-2 h-2 rounded-full" [ngClass]="session.micOn ? 'bg-emerald-500' : 'bg-slate-500'"></span>
                </div>
              </div>

              <!-- Candidate Info -->
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="font-bold text-white text-sm">{{ session.candidateName }}</h3>
                    <p class="text-xs text-slate-400 truncate w-32" [title]="session.assessmentName">{{ session.assessmentName }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-mono text-emerald-400">{{ session.timeElapsed }}</p>
                    <p class="text-[10px] text-slate-500">{{ session.progress }}% Complete</p>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="w-full h-1 bg-slate-700 rounded-full mt-2 mb-4 overflow-hidden">
                   <div class="h-full bg-emerald-500" [style.width.%]="session.progress"></div>
                </div>

                <!-- Action Bar -->
                <div class="flex gap-2">
                  <button class="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white rounded transition-colors flex items-center justify-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Message
                  </button>
                  <button class="flex-1 py-1.5 border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Pause
                  </button>
                </div>
              </div>
              
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class ProctoringPageComponent implements OnInit, OnDestroy {
  private proctoringService = inject(ProctoringService);
  private subscription: Subscription | null = null;
  
  activeSessions: ProctoringSession[] = [];
  activeCandidatesCount = 0;
  flaggedEventsCount = 0;

  ngOnInit() {
    this.subscription = this.proctoringService.liveSessions$.subscribe({
      next: (res) => {
        if (res.success) {
          this.activeSessions = res.data;
          this.activeCandidatesCount = this.activeSessions.length;
          this.flaggedEventsCount = this.activeSessions.filter(s => s.flagged).length;
        }
      },
      error: (err) => console.error('Error fetching live sessions', err)
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
