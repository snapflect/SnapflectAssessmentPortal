import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../core/services/toast.service';

interface MyPublication {
  uuid: string; // Session UUID
  attributes: {
    title: string;
    publication_code: string;
    status: string;
    start_date: string;
    end_date: string;
    max_attempts: number;
    is_proctored: boolean;
    duration_minutes?: number;
  };
  relationships?: {
    assessment?: { attributes: { title: string; pass_marks: number; total_marks: number } };
  };
  meta?: {
    attempts_used: number;
    attempts_remaining: number;
    best_score?: number;
    is_passed?: boolean;
    latest_attempt_uuid?: string;
    latest_result_uuid?: string;
  };
}

@Component({
  selector: 'app-candidate-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-main">My Assessments</h2>
        <p class="text-muted text-sm mt-1">Your assigned tests and current progress.</p>
      </div>

      <!-- Status Tabs -->
      <div class="flex gap-3 mb-8 border-b border-border-light pb-4">
        <button *ngFor="let tab of tabs" (click)="setTab(tab)" class="px-5 py-2.5 rounded-full font-semibold transition-all duration-300 relative overflow-hidden"
                [ngClass]="activeTab === tab ? 'text-white shadow-lg' : 'text-slate-500 hover:text-muted bg-surface/50 hover:bg-surface'">
          
          <!-- Active Tab Background (Gradient) -->
          <div *ngIf="activeTab === tab" class="absolute inset-0 bg-gradient-to-r from-brand to-brand-light -z-10"></div>
          
          <span class="relative z-10">{{ tab }}</span>
          <span class="ml-2 text-[10px] px-2 py-0.5 rounded-full z-10 relative"
                [ngClass]="activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-500/10 text-slate-500'">
            {{ getTabCount(tab) }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-muted font-medium animate-pulse">Loading your assessments...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && filteredPubs.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600 bg-surface/30 rounded-3xl border border-border-light border-dashed">
        <div class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-main mb-2">No {{ activeTab !== 'All' ? activeTab.toLowerCase() : '' }} assessments</h3>
        <p class="text-sm text-muted text-center max-w-sm">You don't have any assessments in this category right now. Check back later or contact your administrator.</p>
      </div>

      <!-- Assessment Cards Grid -->
      <div *ngIf="!loading && filteredPubs.length > 0" class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let pub of filteredPubs" class="glass-card relative overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">
            
            <!-- Top Status Bar Indicator -->
            <div class="absolute top-0 left-0 w-full h-1 z-10" [ngClass]="getStatusBarClass(pub)"></div>

            <!-- Due Soon Warning -->
            <div *ngIf="isDueSoon(pub)" class="absolute top-3 right-3 z-10 flex items-center bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              <span class="flex h-2 w-2 relative mr-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
              Due Soon
            </div>

            <div class="p-6 flex-1 flex flex-col relative z-0">
              
              <!-- Header -->
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" [ngClass]="getIconBoxClass(pub)">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="!isCompleted(pub)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    <path *ngIf="isCompleted(pub) && pub.meta?.is_passed" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    <path *ngIf="isCompleted(pub) && !pub.meta?.is_passed" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" [ngClass]="getBadgeClass(pub)">
                    {{ pub.attributes.status }}
                  </span>
                  <span *ngIf="pub.attributes.is_proctored" class="mt-1 text-[9px] bg-danger/10 text-danger border border-danger/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">Proctored</span>
                </div>
              </div>

              <!-- Title & Details -->
              <h3 class="text-lg font-bold text-main leading-tight mb-1 line-clamp-2" [title]="pub.attributes.title">{{ pub.attributes.title }}</h3>
              <p class="text-sm text-slate-500 mb-4 line-clamp-1">{{ pub.relationships?.assessment?.attributes?.title }}</p>

              <div class="grid grid-cols-2 gap-3 mb-6 bg-surface/40 p-3 rounded-xl border border-border-light/50">
                <div>
                  <span class="block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Duration</span>
                  <span class="text-sm font-medium text-main">{{ pub.attributes.duration_minutes ? pub.attributes.duration_minutes + ' min' : 'No Limit' }}</span>
                </div>
                <div>
                  <span class="block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Attempts</span>
                  <span class="text-sm font-medium" [ngClass]="(pub.meta?.attempts_remaining ?? pub.attributes.max_attempts) <= 0 ? 'text-danger' : 'text-main'">
                    {{ pub.meta?.attempts_used || 0 }} / {{ pub.attributes.max_attempts }}
                    <span *ngIf="(pub.meta?.attempts_remaining ?? pub.attributes.max_attempts) > 0" class="text-[10px] text-success ml-1">({{ pub.meta?.attempts_remaining ?? pub.attributes.max_attempts }} left)</span>
                    <span *ngIf="(pub.meta?.attempts_remaining ?? pub.attributes.max_attempts) <= 0" class="text-[10px] text-danger ml-1">(None left)</span>
                  </span>
                </div>
                <div class="col-span-2 pt-2 border-t border-border-light/50">
                  <span class="block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Window</span>
                  <span class="text-xs text-muted">{{ pub.attributes.start_date | date:'dd MMM yyyy' }} - {{ pub.attributes.end_date ? (pub.attributes.end_date | date:'dd MMM yyyy') : 'No Expiry' }}</span>
                </div>
              </div>

              <div class="mt-auto">
                <!-- Start/Retake Button -->
                <button *ngIf="canStart(pub)" 
                        (click)="startAssessment(pub)"
                        [disabled]="launching === pub.uuid"
                        class="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-brand to-brand-light hover:shadow-lg hover:shadow-brand/25 flex items-center justify-center gap-2">
                  
                  <svg *ngIf="launching === pub.uuid" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  
                  <ng-container *ngIf="launching !== pub.uuid">
                    <svg *ngIf="(pub.meta?.attempts_used || 0) > 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <svg *ngIf="(pub.meta?.attempts_used || 0) === 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                    <span>{{ (pub.meta?.attempts_used || 0) > 0 ? 'Retake Assessment' : 'Start Assessment' }}</span>
                    <span class="text-[10px] opacity-70 ml-1" *ngIf="(pub.meta?.attempts_used || 0) > 0">
                      (Attempt {{ (pub.meta?.attempts_used || 0) + 1 }} of {{ pub.attributes.max_attempts }})
                    </span>
                  </ng-container>
                  <span *ngIf="launching === pub.uuid">Launching...</span>
                </button>

                <!-- Results State -->
                <div *ngIf="isCompleted(pub)" class="flex items-center justify-between bg-surface/50 p-1 rounded-xl border border-border-light">
                  <div class="px-4 py-2 flex items-center gap-3">
                    <div class="relative w-10 h-10 flex items-center justify-center rounded-full"
                         [ngClass]="pub.meta?.is_passed ? 'bg-success/10' : 'bg-danger/10'">
                      <span class="text-sm font-bold" [ngClass]="pub.meta?.is_passed ? 'text-success' : 'text-danger'">{{ pub.meta?.best_score }}%</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold uppercase tracking-wider" [ngClass]="pub.meta?.is_passed ? 'text-success' : 'text-danger'">
                        {{ pub.meta?.is_passed ? 'Passed' : 'Failed' }}
                      </p>
                      <p class="text-[10px] text-muted">Final Score</p>
                    </div>
                  </div>
                  <button (click)="viewResults(pub)" class="mr-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-white/10 border border-border-light text-xs font-semibold text-main hover:text-white transition-colors flex items-center gap-1 shadow-sm" title="View Detailed Results">
                    View Results
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Pending State -->
                <div *ngIf="isPending(pub)" class="w-full py-3 rounded-xl font-semibold text-slate-500 bg-surface/50 border border-border-light text-center flex justify-center items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Opens in {{ getDaysUntil(pub.attributes.start_date) }} days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CandidateDashboardPageComponent implements OnInit {
  publications: MyPublication[] = [];
  filteredPubs: MyPublication[] = [];
  loading = true;
  launching: string | null = null;
  activeTab = 'All';
  tabs = ['All', 'Upcoming', 'Active', 'Completed'];

  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit() { this.fetchPublications(); }

  fetchPublications() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/delivery/my-assessments`)
      .subscribe({
        next: (res) => {
          this.publications = res.data || res;
          this.applyTab();
          this.loading = false;
        },
        error: (err) => { 
          console.error(err); 
          this.toast.error('Error', 'Failed to load your assessments.');
          this.loading = false; 
        }
      });
  }

  setTab(tab: string) { this.activeTab = tab; this.applyTab(); }

  applyTab() {
    if (this.activeTab === 'All') { this.filteredPubs = [...this.publications]; return; }
    const map: Record<string, string[]> = {
      'Upcoming': ['SCHEDULED'],
      'Active': ['ACTIVE'],
      'Completed': ['COMPLETED']
    };
    const statuses = map[this.activeTab] || [];
    this.filteredPubs = this.publications.filter(p => statuses.includes(p.attributes.status));
  }

  getTabCount(tab: string): number {
    if (tab === 'All') return this.publications.length;
    const map: Record<string, string[]> = { 'Upcoming': ['SCHEDULED'], 'Active': ['ACTIVE'], 'Completed': ['COMPLETED'] };
    return this.publications.filter(p => (map[tab] || []).includes(p.attributes.status)).length;
  }

  isCompleted(pub: MyPublication): boolean {
    return pub.attributes.status === 'COMPLETED';
  }

  canStart(pub: MyPublication): boolean {
    return pub.attributes.status === 'ACTIVE' && (pub.meta?.attempts_remaining ?? 1) > 0;
  }

  isPending(pub: MyPublication): boolean {
    return pub.attributes.status === 'SCHEDULED';
  }

  isDueSoon(pub: MyPublication): boolean {
    if (!this.canStart(pub) || !pub.attributes.end_date) return false;
    const diff = new Date(pub.attributes.end_date).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3; // Due within 3 days
  }

  getDaysUntil(startDate: string): number {
    const diff = new Date(startDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  startAssessment(pub: MyPublication) {
    this.launching = pub.uuid;
    // Call the launch endpoint using the session UUID
    this.http.post<any>(`${environment.apiUrl}/delivery/sessions/${pub.uuid}/launch`, {}).subscribe({
      next: (res) => {
        const attemptUuid = res.data?.attempt_uuid || res.attempt_uuid;
        if (attemptUuid) {
          this.router.navigate(['/delivery/attempts', attemptUuid]);
        } else {
          this.toast.error('Error', 'Invalid launch response.');
          this.launching = null;
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', err.error?.message || 'Failed to launch the assessment.');
        this.launching = null;
      }
    });
  }

  viewResults(pub: MyPublication) {
    if (pub.meta?.latest_result_uuid) {
      this.router.navigate(['/results', pub.meta.latest_result_uuid]);
    } else {
      this.toast.error('Error', 'No result found to display.');
    }
  }

  getStatusBarClass(pub: MyPublication): string {
    if (this.isCompleted(pub)) return pub.meta?.is_passed ? 'bg-success' : 'bg-danger';
    if (this.canStart(pub)) return 'bg-brand';
    return 'bg-surface-dark';
  }

  getIconBoxClass(pub: MyPublication): string {
    if (this.isCompleted(pub)) return pub.meta?.is_passed ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger';
    if (this.canStart(pub)) return 'bg-brand/20 text-brand-light';
    return 'bg-surface-light text-muted';
  }

  getBadgeClass(pub: MyPublication): string {
    const map: Record<string, string> = {
      'ACTIVE': 'bg-success/20 text-success',
      'SCHEDULED': 'bg-info/20 text-info',
      'COMPLETED': 'bg-surface-light text-muted',
      'CANCELLED': 'bg-danger/20 text-danger',
    };
    return map[pub.attributes.status] || 'bg-surface-light text-muted';
  }
}