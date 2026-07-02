import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Session {
  uuid: string;
  session_status: string;
  access_started_at: string;
  access_expires_at: string;
  created_date: string;
  candidate_name?: string;
  candidate_email?: string;
  ip_address?: string;
  browser_info?: string;
  candidate?: { first_name: string; last_name: string; email: string };
  assessment?: { title: string };
}

@Component({
  selector: 'app-session-list-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col relative">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-main flex items-center gap-3">
            Active Sessions
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h2>
          <p class="text-muted text-sm mt-1">Real-time proctor view — auto-refreshes every 15 seconds.</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-slate-500">Last updated: {{ lastUpdated | date:'HH:mm:ss' }}</span>
          <button (click)="fetchSessions()" class="btn-secondary text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-emerald-400">{{ activeSessions }}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mt-1">Active</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-amber-400">{{ pausedSessions }}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mt-1">Paused</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-blue-400">{{ completedToday }}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mt-1">Completed Today</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-3xl font-bold text-red-400">{{ expiredSessions }}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mt-1">Expired</div>
        </div>
      </div>

      <!-- Session Cards Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div *ngIf="loading" class="flex items-center justify-center py-20">
          <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div *ngIf="!loading && sessions.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-600">
          <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg">No active sessions at this time.</p>
        </div>

        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div *ngFor="let session of sessions" class="glass-card p-5 relative overflow-hidden group">
            <!-- Status stripe -->
            <div class="absolute top-0 left-0 w-1 h-full"
                 [ngClass]="getStripeClass(session.session_status)"></div>

            <div class="pl-3">
              <!-- Header -->
              <div class="flex items-start justify-between mb-3">
                <div>
                  <span class="text-xs font-mono text-brand-light">{{ session.uuid.substring(0,8) }}</span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" [ngClass]="getDotClass(session.session_status)"></span>
                    <span class="text-xs text-muted uppercase tracking-wider font-medium">{{ session.session_status }}</span>
                  </div>
                </div>
                <span class="text-xs text-slate-600">{{ (session.access_started_at || session.created_date) | date:'HH:mm' }}</span>
              </div>

              <!-- Candidate Info -->
              <div class="mb-3">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand/40 to-brand-light/40 flex items-center justify-center text-main font-bold text-xs">
                    {{ getCandidateInitials(session) }}
                  </div>
                  <div>
                    <p class="text-main font-medium text-sm">{{ getCandidateName(session) }}</p>
                    <p class="text-slate-500 text-xs">{{ getCandidateEmail(session) }}</p>
                  </div>
                </div>
              </div>

              <!-- Assessment -->
              <div class="text-xs text-slate-500 mb-3 truncate">
                📋 {{ session.assessment?.title || 'Unknown Assessment' }}
              </div>

              <!-- Time Remaining -->
              <div class="flex items-center justify-between pt-3 border-t border-border-light">
                <div class="text-xs">
                  <span class="text-slate-600">Expires: </span>
                  <span [ngClass]="isExpiringSoon(session.access_expires_at) ? 'text-red-400 font-medium' : 'text-muted'">
                    {{ session.access_expires_at | date:'HH:mm' }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <button class="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors">
                    Pause
                  </button>
                  <button class="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors">
                    Terminate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SessionListPageComponent implements OnInit, OnDestroy {
  sessions: Session[] = [];
  loading = true;
  lastUpdated = new Date();
  private refreshSub?: Subscription;

  get activeSessions() { return this.sessions.filter(s => s.session_status === 'ACTIVE').length; }
  get pausedSessions() { return this.sessions.filter(s => s.session_status === 'PAUSED').length; }
  get completedToday() { return this.sessions.filter(s => s.session_status === 'COMPLETED').length; }
  get expiredSessions() { return this.sessions.filter(s => s.session_status === 'EXPIRED').length; }

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchSessions(true);
    // Auto-refresh every 15 seconds
    this.refreshSub = interval(15000).subscribe(() => this.fetchSessions(false));
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  fetchSessions(showLoader = false) {
    if (showLoader) {
      this.loading = true;
    }
    this.http.get<any>(`${environment.apiUrl}/delivery/sessions?include=candidate,assessment&per_page=50`)
      .subscribe({
        next: (res) => {
          this.sessions = res.data || res;
          this.lastUpdated = new Date();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getCandidateName(s: Session): string {
    if (s.candidate) {
      return `${s.candidate.first_name} ${s.candidate.last_name}`;
    }
    return s.candidate_name || 'Unknown';
  }

  getCandidateEmail(s: Session): string {
    return s.candidate?.email || s.candidate_email || '';
  }

  getCandidateInitials(s: Session): string {
    const name = this.getCandidateName(s);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isExpiringSoon(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 10 * 60 * 1000; // less than 10 minutes
  }

  getStripeClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'bg-emerald-500',
      'PAUSED': 'bg-amber-500',
      'COMPLETED': 'bg-blue-500',
      'EXPIRED': 'bg-red-500',
      'TERMINATED': 'bg-slate-500'
    };
    return map[status] || 'bg-slate-500';
  }

  getDotClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'bg-emerald-500 animate-pulse',
      'PAUSED': 'bg-amber-500',
      'COMPLETED': 'bg-blue-500',
      'EXPIRED': 'bg-red-500',
      'TERMINATED': 'bg-slate-500'
    };
    return map[status] || 'bg-slate-500';
  }
}