import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface DashboardMetrics {
  roleContext?: string;
  availableRoles?: string[];
  organizations_count?: number;
  users_count?: number;
  assessments_count?: number;
  active_sessions?: number;
  pending_reviews?: number;
  total_attempts?: number;
  active_question_banks?: number;
  question_banks_count?: number;
  questions_created?: number;
  published_assessments?: number;
  draft_assessments?: number;
  completed_reviews?: number;
  average_score_awarded?: number;
  pending_assessments?: number;
  completed_assessments?: number;
  certificates_earned?: number;
  flagged_sessions?: number;
  terminated_sessions?: number;
  active_subscriptions?: number;
  pending_invoices?: number;
  open_tickets?: number;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-white">Dashboard</h2>
          <p class="text-slate-400 text-sm mt-1">Platform overview and high-level metrics.</p>
        </div>
        
        <!-- Role Switcher -->
        <div *ngIf="availableRoles.length > 1" class="flex items-center space-x-3">
          <span class="text-sm text-slate-400">View as:</span>
          <select [ngModel]="metrics?.roleContext" (ngModelChange)="switchRole($event)" class="bg-black/30 border border-white/10 text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-2 custom-select">
             <option *ngFor="let role of availableRoles" [value]="role">{{ getRoleName(role) }}</option>
          </select>
        </div>
      </div>

      <div [ngSwitch]="metrics?.roleContext" class="shrink-0">
        
        <!-- PLATFORM_ADMIN -->
        <ng-container *ngSwitchCase="'PLATFORM_ADMIN'">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Organizations</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-brand/10 group-hover:text-brand/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-accent/10 group-hover:text-accent/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- CLIENT_ADMIN -->
        <ng-container *ngSwitchCase="'CLIENT_ADMIN'">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Pending Reviews</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- ASSESSMENT_MANAGER -->
        <ng-container *ngSwitchCase="'ASSESSMENT_MANAGER'">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Question Banks</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_question_banks || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Total Attempts</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.total_attempts || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Pending Reviews</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- CONTENT_CREATOR -->
        <ng-container *ngSwitchCase="'CONTENT_CREATOR'">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Question Banks</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.question_banks_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Questions Created</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.questions_created || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Published Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.published_assessments || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-slate-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Draft Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.draft_assessments || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- REVIEWER -->
        <ng-container *ngSwitchCase="'REVIEWER'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-amber-500/20">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Pending Manual Reviews</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Completed Reviews</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.completed_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Average Score Awarded</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.average_score_awarded || 0 }}%</h3>
            </div>
          </div>
        </ng-container>

        <!-- CANDIDATE -->
        <ng-container *ngSwitchCase="'CANDIDATE'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-brand/20">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Pending Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.pending_assessments || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Completed</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.completed_assessments || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Certificates Earned</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.certificates_earned || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- PROCTOR -->
        <ng-container *ngSwitchCase="'PROCTOR'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-brand/20">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Flagged Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.flagged_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-red-500/20">
              <div class="p-3 bg-red-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Terminated Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.terminated_sessions || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- BILLING_ADMIN -->
        <ng-container *ngSwitchCase="'BILLING_ADMIN'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Total Organizations</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-emerald-500/20">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Subscriptions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_subscriptions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Pending Invoices</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.pending_invoices || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- READ_ONLY -->
        <ng-container *ngSwitchCase="'READ_ONLY'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Organizations</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
            </div>
          </div>
        </ng-container>

        <!-- SUPPORT -->
        <ng-container *ngSwitchCase="'SUPPORT'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-red-500/20">
              <div class="p-3 bg-red-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              </div>
              <p class="text-slate-400 text-sm font-medium z-10">Open Support Tickets</p>
              <h3 class="text-3xl font-bold text-white mt-1 z-10">{{ metrics?.open_tickets || 0 }}</h3>
            </div>
          </div>
        </ng-container>

      </div>
      
      <!-- Placeholder Chart Area (Shared across all roles) -->
      <div class="glass-card flex-1 p-6 flex flex-col justify-center items-center text-slate-500 min-h-[250px] shrink-0 mb-6" *ngIf="!loading">
        <svg class="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <p class="text-lg font-medium">Activity Chart coming soon</p>
        <p class="text-sm mt-1">Check back later for interactive {{ getRoleName(metrics?.roleContext || '') }} analytics.</p>
      </div>

    </div>
  `
})
export class DashboardPageComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  loading = true;
  availableRoles: string[] = [];
  
  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchMetrics();
  }

  fetchMetrics(role?: string) {
    this.loading = true;
    let url = `${environment.apiUrl}/analytics/dashboard/summary`;
    if (role) {
      url += `?role=${encodeURIComponent(role)}`;
    }
    
    this.http.get<{data: DashboardMetrics}>(url)
      .subscribe({
        next: (response) => {
          this.metrics = response.data;
          this.availableRoles = this.metrics?.availableRoles || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching dashboard metrics', err);
          this.loading = false;
        }
      });
  }

  switchRole(newRole: string) {
    if (this.metrics && this.metrics.roleContext !== newRole) {
      this.fetchMetrics(newRole);
    }
  }

  getRoleName(roleCode: string): string {
    const roles: Record<string, string> = {
      'PLATFORM_ADMIN': 'Platform Administrator',
      'ASSESSMENT_MANAGER': 'Assessment Manager',
      'CONTENT_CREATOR': 'Content Creator',
      'REVIEWER': 'Reviewer',
      'CANDIDATE': 'Candidate',
      'CLIENT_ADMIN': 'Client Admin',
      'PROCTOR': 'Proctor',
      'BILLING_ADMIN': 'Billing Admin',
      'READ_ONLY': 'Read Only',
      'SUPPORT': 'Support'
    };
    return roles[roleCode] || roleCode;
  }
}
