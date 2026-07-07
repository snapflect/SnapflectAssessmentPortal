import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-session-monitor-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Session Monitor</h2>
          <p class="text-muted text-sm mt-1">High-level support overview of all active assessment sessions.</p>
        </div>
        <div class="flex space-x-3">
          <div class="bg-input-bg border border-border-light rounded-lg px-4 py-2 flex items-center">
            <svg class="w-4 h-4 text-brand-light mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search sessions..." 
                   (input)="onSearch($event)"
                   class="bg-transparent border-none focus:outline-none text-sm text-main w-64 placeholder:text-muted">
          </div>
          <button (click)="refreshData()" [disabled]="isRefreshing" class="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <svg *ngIf="!isRefreshing" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <svg *ngIf="isRefreshing" class="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0 transition-opacity duration-300" [class.opacity-50]="isRefreshing">
        <div class="bg-card border border-border-light rounded-xl p-6 shadow-sm">
          <h3 class="text-sm font-medium text-muted mb-2">Total Active</h3>
          <p class="text-3xl font-bold text-main">{{ metrics.total_active | number }}</p>
        </div>
        <div class="bg-card border border-border-light rounded-xl p-6 shadow-sm">
          <h3 class="text-sm font-medium text-muted mb-2">Flagged Sessions</h3>
          <p class="text-3xl font-bold text-rose-500">{{ metrics.flagged_sessions | number }}</p>
        </div>
        <div class="bg-card border border-border-light rounded-xl p-6 shadow-sm">
          <h3 class="text-sm font-medium text-muted mb-2">Network Warnings</h3>
          <p class="text-3xl font-bold text-amber-500">{{ metrics.network_warnings | number }}</p>
        </div>
        <div class="bg-card border border-border-light rounded-xl p-6 shadow-sm">
          <h3 class="text-sm font-medium text-muted mb-2">Avg. Completion</h3>
          <p class="text-3xl font-bold text-emerald-500">{{ metrics.avg_completion }}%</p>
        </div>
      </div>

      <div class="bg-card flex-1 p-6 border border-border-light shadow-lg rounded-xl flex flex-col min-h-0 transition-opacity duration-300" [class.opacity-50]="isRefreshing">
        <div class="flex justify-between items-center mb-6">
           <h3 class="font-bold text-main">Live Telemetry</h3>
           <button class="text-sm text-brand-light hover:underline flex items-center gap-1">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
             Filter Events
           </button>
        </div>
        
        <div class="table-responsive flex-1">
          <table class="w-full text-left border-collapse min-w-[800px]">
             <thead class="sticky top-0 bg-card z-10">
               <tr class="bg-input-bg">
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light rounded-tl-lg">Session ID</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Candidate</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">IP Address</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Status</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Latency</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light text-right rounded-tr-lg">Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr *ngFor="let session of filteredSessions" class="border-b border-border-light hover:bg-input-bg transition-colors">
                 <td class="p-4 text-sm text-brand-light font-mono cursor-pointer hover:underline">{{ session.id }}</td>
                 <td class="p-4">
                   <div class="text-sm font-medium text-main">{{ session.candidate }}</div>
                   <div class="text-xs text-muted">{{ session.email }}</div>
                 </td>
                 <td class="p-4 text-sm text-muted font-mono">{{ session.ip }}</td>
                 <td class="p-4">
                   <span class="px-2.5 py-1 text-xs font-semibold rounded-full" 
                         [ngClass]="{
                           'bg-emerald-500/20 text-emerald-500': session.status === 'Healthy',
                           'bg-rose-500/20 text-rose-500': session.status === 'Flagged',
                           'bg-amber-500/20 text-amber-500': session.status === 'Warning'
                         }">
                     {{ session.status }}
                   </span>
                 </td>
                 <td class="p-4 text-sm">
                   <div class="flex items-center">
                     <div class="w-2 h-2 rounded-full mr-2" 
                          [ngClass]="session.latency < 100 ? 'bg-emerald-500' : (session.latency < 300 ? 'bg-amber-500' : 'bg-rose-500')"></div>
                     <span class="text-muted">{{ session.latency }}ms</span>
                   </div>
                 </td>
                 <td class="p-4 text-right">
                   <button (click)="viewLogs(session)" class="text-sm border border-border-light px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">View Logs</button>
                 </td>
               </tr>
               <tr *ngIf="filteredSessions.length === 0">
                 <td colspan="6" class="p-8 text-center text-muted">
                   No sessions found matching "{{ searchTerm }}"
                 </td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SessionMonitorPageComponent implements OnInit {
  isRefreshing = false;
  searchTerm = '';
  
  sessions: any[] = [];
  metrics = {
    total_active: 0,
    flagged_sessions: 0,
    network_warnings: 0,
    avg_completion: 0
  };

  private toast = inject(ToastService);
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refreshData();
  }

  get filteredSessions() {
    if (!this.searchTerm) return this.sessions;
    
    const term = this.searchTerm.toLowerCase();
    return this.sessions.filter(session => 
      session.candidate.toLowerCase().includes(term) ||
      session.email.toLowerCase().includes(term) ||
      session.id.toLowerCase().includes(term) ||
      session.ip.includes(term) ||
      session.status.toLowerCase().includes(term)
    );
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  refreshData() {
    this.isRefreshing = true;
    
    this.http.get<any>(`${environment.apiUrl}/delivery/telemetry`).subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = response.data.sessions;
          this.metrics = {
            total_active: response.data.total_active,
            flagged_sessions: response.data.flagged_sessions,
            network_warnings: response.data.network_warnings,
            avg_completion: response.data.avg_completion
          };
        }
        this.isRefreshing = false;
      },
      error: (err) => {
        console.error('Failed to load telemetry', err);
        this.isRefreshing = false;
      }
    });
  }

  viewLogs(session: any) {
    console.log('Viewing logs for session:', session);
    this.toast.info('Feature Coming Soon', 'Detailed telemetry logs and attempt audits will be available in the next release.');
  }
}
