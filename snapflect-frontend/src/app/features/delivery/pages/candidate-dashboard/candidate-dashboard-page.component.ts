import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface MyPublication {
  uuid: string;
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
    myAttempts?: { attributes: { status: string } }[];
  };
  meta?: {
    attempts_used: number;
    attempts_remaining: number;
    last_score?: number;
    best_score?: number;
    is_passed?: boolean;
  };
}

@Component({
  selector: 'app-candidate-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white">My Assessments</h2>
        <p class="text-slate-400 text-sm mt-1">Your assigned tests and their current status.</p>
      </div>

      <!-- Status Tabs -->
      <div class="flex gap-2 mb-6 border-b border-white/10 pb-4">
        <button *ngFor="let tab of tabs" (click)="setTab(tab)" class="px-4 py-2 text-sm rounded-lg font-medium transition-all"
                [ngClass]="activeTab === tab ? 'bg-brand/20 text-brand-light border border-brand/30' : 'text-slate-500 hover:text-slate-300'">
          {{ tab }}
          <span class="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/5">{{ getTabCount(tab) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && filteredPubs.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600">
        <svg class="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p class="text-xl">No assessments in this category.</p>
      </div>

      <!-- Assessment Cards -->
      <div *ngIf="!loading" class="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
        <div *ngFor="let pub of filteredPubs" class="glass-card p-6 flex items-center gap-6 group hover:border-brand/30 transition-all">

          <!-- Status Icon -->
          <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
               [ngClass]="getCardIconBg(pub)">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!isCompleted(pub)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              <path *ngIf="isCompleted(pub) && pub.meta?.is_passed" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              <path *ngIf="isCompleted(pub) && !pub.meta?.is_passed" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-white font-semibold truncate">{{ pub.attributes.title }}</h3>
              <span *ngIf="pub.attributes.is_proctored" class="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded flex-shrink-0">Proctored</span>
            </div>
            <p class="text-slate-500 text-sm truncate">{{ pub.relationships?.assessment?.attributes?.title }}</p>

            <!-- Dates -->
            <div class="flex gap-4 text-xs text-slate-500 mt-2">
              <span>Opens: <span class="text-slate-400">{{ pub.attributes.start_date | date:'dd MMM, HH:mm' }}</span></span>
              <span>Closes: <span class="text-slate-400">{{ pub.attributes.end_date | date:'dd MMM, HH:mm' }}</span></span>
              <span *ngIf="pub.attributes.duration_minutes">Duration: <span class="text-slate-400">{{ pub.attributes.duration_minutes }} min</span></span>
            </div>
          </div>

          <!-- Score (if completed) -->
          <div *ngIf="isCompleted(pub) && pub.meta?.best_score !== undefined" class="text-center flex-shrink-0 w-20">
            <div class="text-2xl font-bold" [ngClass]="pub.meta?.is_passed ? 'text-emerald-400' : 'text-red-400'">
              {{ pub.meta?.best_score }}%
            </div>
            <div class="text-xs mt-0.5" [ngClass]="pub.meta?.is_passed ? 'text-emerald-600' : 'text-red-600'">
              {{ pub.meta?.is_passed ? 'PASSED' : 'FAILED' }}
            </div>
          </div>

          <!-- Attempts badge -->
          <div class="text-center flex-shrink-0 w-24">
            <div class="text-sm text-slate-400">
              <span class="text-white font-bold">{{ pub.meta?.attempts_used || 0 }}</span> / {{ pub.attributes.max_attempts }}
            </div>
            <div class="text-xs text-slate-600 mt-0.5">attempts</div>
          </div>

          <!-- Action Button -->
          <div class="flex-shrink-0">
            <button *ngIf="canStart(pub)" class="btn-primary text-sm py-2 px-5">
              {{ (pub.meta?.attempts_used || 0) > 0 ? 'Retake' : 'Start Now' }}
            </button>
            <button *ngIf="isCompleted(pub)" class="btn-secondary text-sm py-2 px-5">
              View Results
            </button>
            <span *ngIf="isPending(pub)" class="text-xs text-slate-500 px-4">Not yet available</span>
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
  activeTab = 'All';
  tabs = ['All', 'Upcoming', 'Active', 'Completed'];

  private http = inject(HttpClient);

  ngOnInit() { this.fetchPublications(); }

  fetchPublications() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/assessment/publications?include=assessment&per_page=50`)
      .subscribe({
        next: (res) => {
          this.publications = res.data || res;
          this.applyTab();
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
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
    return (pub.meta?.attempts_used || 0) > 0 && pub.attributes.status === 'COMPLETED';
  }

  canStart(pub: MyPublication): boolean {
    const now = Date.now();
    const start = new Date(pub.attributes.start_date).getTime();
    const end = new Date(pub.attributes.end_date).getTime();
    const attemptsLeft = (pub.meta?.attempts_remaining ?? pub.attributes.max_attempts) > 0;
    return now >= start && now <= end && attemptsLeft;
  }

  isPending(pub: MyPublication): boolean {
    return Date.now() < new Date(pub.attributes.start_date).getTime();
  }

  getCardIconBg(pub: MyPublication): string {
    if (this.isCompleted(pub)) {
      return pub.meta?.is_passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400';
    }
    if (this.canStart(pub)) return 'bg-brand/15 text-brand-light';
    return 'bg-slate-500/15 text-slate-400';
  }
}