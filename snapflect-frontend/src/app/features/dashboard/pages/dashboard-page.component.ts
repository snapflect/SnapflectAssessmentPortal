import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UserStore } from '../../../shared/stores/user.store';

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
  upcoming_sessions?: { assessment_name: string; scheduled_date: string; status: string }[];
  charts?: {
    userGrowth: {
      categories: string[];
      series: { name: string, data: number[] }[];
    };
    completionRates: {
      categories: string[];
      series: { name: string, data: number[] }[];
    };
  };
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto relative">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Dashboard</h2>
          <p class="text-muted text-sm mt-1">Platform overview and high-level metrics.</p>
        </div>
        
        <!-- Role Switcher Trigger -->
        <div *ngIf="availableRoles.length > 1" class="flex items-center space-x-3">
          <span class="text-sm text-muted">Viewing as:</span>
          <button (click)="openRoleModal()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-brand/30 text-brand-light px-4 py-2 rounded-lg transition-colors font-medium shadow-sm shadow-brand/10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            {{ getRoleName(metrics?.roleContext || '') }}
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </div>

      <div [ngSwitch]="metrics?.roleContext" class="shrink-0" [class.opacity-30]="showRoleModal" [class.pointer-events-none]="showRoleModal" class="transition-opacity duration-300">
        
        <!-- PLATFORM_ADMIN -->
        <ng-container *ngSwitchCase="'PLATFORM_ADMIN'">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Organizations</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-brand/10 group-hover:text-brand/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-accent/10 group-hover:text-accent/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
              <div class="absolute -right-6 -top-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none">
                <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Pending Reviews</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Question Banks</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_question_banks || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Total Attempts</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.total_attempts || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Pending Reviews</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Question Banks</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.question_banks_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Questions Created</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.questions_created || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-indigo-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Published Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.published_assessments || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-slate-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Draft Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.draft_assessments || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Pending Manual Reviews</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.pending_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Completed Reviews</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.completed_reviews || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Average Score Awarded</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.average_score_awarded || 0 }}%</h3>
            </div>
          </div>
        </ng-container>

        <!-- CANDIDATE — Rich Learner Experience -->
        <ng-container *ngSwitchCase="'CANDIDATE'">

          <!-- Welcome Banner -->
          <div class="glass-card p-6 mb-6 flex items-center justify-between relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-brand/10 to-accent/5 pointer-events-none"></div>
            <div class="z-10">
              <h3 class="text-2xl font-bold text-main">Welcome back, {{ userStore.profile()?.first_name || 'Candidate' }}! 👋</h3>
              <p class="text-muted text-sm mt-1">You have <span class="font-semibold text-brand-light">{{ metrics?.pending_assessments || 0 }} pending assessment(s)</span> to complete.</p>
            </div>
            <a routerLink="/delivery/dashboard"
               class="z-10 flex-shrink-0 ml-6 px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-brand to-accent text-white shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              Start Assessment
            </a>
          </div>

          <!-- Stat Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-brand/20">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Pending Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.pending_assessments || 0 }}</h3>
              <a routerLink="/delivery/dashboard" class="mt-3 text-xs text-brand-light hover:underline z-10">View all →</a>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Completed</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.completed_assessments || 0 }}</h3>
              <a routerLink="/results/candidate" class="mt-3 text-xs text-emerald-400 hover:underline z-10">View results →</a>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Certificates Earned</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.certificates_earned || 0 }}</h3>
              <a routerLink="/certificates" class="mt-3 text-xs text-accent-light hover:underline z-10">View certificates →</a>
            </div>
          </div>

          <!-- Upcoming Sessions List -->
          <div class="glass-card p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-main">Upcoming Assessments</h3>
              <a routerLink="/delivery/dashboard" class="text-xs text-brand-light hover:underline">View all</a>
            </div>
            <div *ngIf="metrics?.upcoming_sessions && metrics!.upcoming_sessions!.length > 0" class="space-y-3">
              <div *ngFor="let session of metrics!.upcoming_sessions" class="flex items-center justify-between p-3 rounded-lg bg-input-bg border border-border-light">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-brand/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-main">{{ session.assessment_name }}</p>
                    <p class="text-xs text-muted">{{ session.scheduled_date }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                      [class.bg-amber-500]="session.status === 'SCHEDULED'"
                      [class.bg-emerald-500]="session.status === 'IN_PROGRESS'"
                      [class.text-black]="true">
                  {{ session.status }}
                </span>
              </div>
            </div>
            <div *ngIf="!metrics?.upcoming_sessions || metrics!.upcoming_sessions!.length === 0"
                 class="text-center py-8 text-muted">
              <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              <p class="text-sm">No upcoming assessments scheduled.</p>
              <p class="text-xs mt-1">Check back later or contact your administrator.</p>
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
              <p class="text-muted text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Flagged Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.flagged_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-red-500/20">
              <div class="p-3 bg-red-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Terminated Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.terminated_sessions || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Total Organizations</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-emerald-500/20">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Subscriptions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_subscriptions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-amber-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Pending Invoices</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.pending_invoices || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Organizations</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.organizations_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-emerald-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Assessments</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.assessments_count || 0 }}</h3>
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
              <p class="text-muted text-sm font-medium z-10">Active Users</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.users_count || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group">
              <div class="p-3 bg-brand/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Active Sessions</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.active_sessions || 0 }}</h3>
            </div>
            <div class="glass-card p-6 flex flex-col relative overflow-hidden group border border-red-500/20">
              <div class="p-3 bg-red-500/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 z-10">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              </div>
              <p class="text-muted text-sm font-medium z-10">Open Support Tickets</p>
              <h3 class="text-3xl font-bold text-main mt-1 z-10">{{ metrics?.open_tickets || 0 }}</h3>
            </div>
          </div>
        </ng-container>

      </div>
      
      <!-- Placeholder Chart: Only for admin roles that benefit from trend data -->
      <div class="glass-card flex-1 p-6 flex flex-col justify-center items-center text-slate-500 min-h-[250px] shrink-0 mb-6"
           *ngIf="!loading && !metrics?.charts && isAdminRole(metrics?.roleContext)"
           [class.opacity-30]="showRoleModal" [class.pointer-events-none]="showRoleModal">
        <svg class="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <p class="text-lg font-medium">Activity Chart coming soon</p>
        <p class="text-sm mt-1">Check back later for interactive {{ getRoleName(metrics?.roleContext || '') }} analytics.</p>
      </div>

      <!-- CSS Bar Charts: Only shown for admin roles with trend data -->
      <div *ngIf="!loading && metrics?.charts && isAdminRole(metrics?.roleContext)" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" [class.opacity-30]="showRoleModal" [class.pointer-events-none]="showRoleModal">
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-main mb-4">User Growth</h3>
          <div class="flex items-end gap-2 h-40">
            <ng-container *ngFor="let val of metrics!.charts!.userGrowth.series[0].data; let i = index">
              <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs text-muted">{{ val }}</span>
                <div class="w-full rounded-t-md bg-blue-500/70 transition-all duration-500"
                     [style.height.%]="getBarHeight(val, metrics!.charts!.userGrowth.series[0].data)"></div>
                <span class="text-xs text-muted truncate w-full text-center">{{ metrics!.charts!.userGrowth.categories[i] }}</span>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-main mb-4">Completion Rates</h3>
          <div class="flex items-end gap-2 h-40">
            <ng-container *ngFor="let label of metrics!.charts!.completionRates.categories; let i = index">
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full flex gap-0.5 items-end">
                  <div class="flex-1 rounded-t-sm bg-emerald-500/70 transition-all duration-500"
                       [style.height.px]="getBarPx(metrics!.charts!.completionRates.series[0].data[i], metrics!.charts!.completionRates.series[0].data)"></div>
                  <div class="flex-1 rounded-t-sm bg-rose-500/70 transition-all duration-500"
                       [style.height.px]="getBarPx(metrics!.charts!.completionRates.series[1].data[i], metrics!.charts!.completionRates.series[1].data)"></div>
                </div>
                <span class="text-xs text-muted truncate w-full text-center">{{ label }}</span>
              </div>
            </ng-container>
          </div>
          <div class="flex gap-4 mt-3">
            <span class="flex items-center gap-1 text-xs text-muted"><span class="w-3 h-3 rounded-sm bg-emerald-500/70 inline-block"></span>Completed</span>
            <span class="flex items-center gap-1 text-xs text-muted"><span class="w-3 h-3 rounded-sm bg-rose-500/70 inline-block"></span>Dropped</span>
          </div>
        </div>
      </div>

      <!-- Role Selection Modal -->
      <div *ngIf="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border-light overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          <div class="px-8 py-6 border-b border-border-light bg-slate-800/50 flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-bold text-main">Select Your Role Context</h3>
              <p class="text-muted mt-1 text-sm">You have multiple roles assigned. Choose the context you want to view.</p>
            </div>
            <button (click)="closeRoleModal()" class="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-full hover:bg-slate-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-8 overflow-y-auto max-h-[60vh]">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button *ngFor="let role of availableRoles" 
                      (click)="switchRole(role)"
                      class="flex flex-col text-left p-5 rounded-xl border transition-all duration-200"
                      [ngClass]="metrics?.roleContext === role ? 'bg-brand/10 border-brand/50 ring-1 ring-brand' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700 hover:border-slate-600'">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-main">{{ getRoleName(role) }}</span>
                  <div *ngIf="metrics?.roleContext === role" class="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <p class="text-xs text-muted">{{ getRoleDescription(role) }}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class DashboardPageComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  loading = true;
  availableRoles: string[] = [];
  showRoleModal = false;

  public userStore = inject(UserStore);
  private http = inject(HttpClient);

  /** Role priority order — highest privilege first */
  private readonly roleHierarchy = [
    'PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER', 'CONTENT_CREATOR',
    'REVIEWER', 'PROCTOR', 'BILLING_ADMIN', 'SUPPORT', 'READ_ONLY', 'CANDIDATE'
  ];

  /** Get the primary role from the JWT profile (client is source of truth for which role to display) */
  private getPrimaryRole(): string {
    const profileRoles = this.userStore.profile()?.roles || [];
    return this.roleHierarchy.find(r => profileRoles.includes(r)) || profileRoles[0] || 'CANDIDATE';
  }

  ngOnInit() {
    // Always pass the primary role from the profile so the backend returns
    // the correct context even if the DB has extra role assignments.
    this.fetchMetrics(this.getPrimaryRole());
  }

  fetchMetrics(role?: string) {
    this.loading = true;
    const effectiveRole = role || this.getPrimaryRole();
    const url = `${environment.apiUrl}/analytics/dashboard/summary?role=${encodeURIComponent(effectiveRole)}`;

    this.http.get<{data: DashboardMetrics}>(url)
      .subscribe({
        next: (response) => {
          this.metrics = response.data;
          // Enforce: roleContext must be one of the user's actual profile roles
          const profileRoles = this.userStore.profile()?.roles || [];
          if (this.metrics && !profileRoles.includes(this.metrics.roleContext || '')) {
            this.metrics.roleContext = effectiveRole;
          }
          this.availableRoles = (this.metrics?.availableRoles || []).filter(r => profileRoles.includes(r));
          
          // Optionally auto-show modal on first load if they have multiple roles
          // We can skip auto-show to avoid annoyance, and just let them use the beautiful button
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching dashboard metrics', err);
          this.loading = false;
        }
      });
  }

  openRoleModal() {
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
  }

  switchRole(newRole: string) {
    if (this.metrics && this.metrics.roleContext !== newRole) {
      this.fetchMetrics(newRole);
    }
    this.closeRoleModal();
  }

  /** True for roles that see trend charts (admin-level analytics) */
  isAdminRole(roleCode?: string): boolean {
    return ['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER'].includes(roleCode || '');
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

  getRoleDescription(roleCode: string): string {
    const descs: Record<string, string> = {
      'PLATFORM_ADMIN': 'Full system access and global configuration.',
      'ASSESSMENT_MANAGER': 'Manage assessments, configurations, and results.',
      'CONTENT_CREATOR': 'Create and manage question banks and blueprints.',
      'REVIEWER': 'Manually review and score candidate submissions.',
      'CANDIDATE': 'Take assigned assessments and view your certificates.',
      'CLIENT_ADMIN': 'Manage organization users and settings.',
      'PROCTOR': 'Monitor active assessment sessions in real-time.',
      'BILLING_ADMIN': 'Manage subscription plans and invoices.',
      'READ_ONLY': 'View-only access to system metrics and reports.',
      'SUPPORT': 'Handle support tickets and view basic user info.'
    };
    return descs[roleCode] || 'Switch to this role context.';
  }

  getBarHeight(val: number, data: number[]): number {
    const max = Math.max(...data);
    return max === 0 ? 0 : Math.round((val / max) * 100);
  }

  getBarPx(val: number, data: number[]): number {
    const max = Math.max(...data);
    return max === 0 ? 0 : Math.round((val / max) * 120);
  }
}
