import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface AssessmentResultDetail {
  id: string;
  attributes: {
    total_score: number;
    percentage_score: number;
    is_passed: boolean;
    status: string;
    scored_at: string;
    result_version: number;
  };
  relationships: {
    candidate?: {
      attributes: {
        first_name: string;
        last_name: string;
      }
    };
    assessment?: {
      attributes: {
        title: string;
      }
    };
    question_scores?: any[];
    section_scores?: any[];
    competency_scores?: any[];
  };
}

@Component({
  selector: 'app-result-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <div *ngIf="loading" class="flex-1 flex justify-center items-center">
        <p class="text-muted">Loading result details...</p>
      </div>

      <div *ngIf="!loading && !result" class="flex-1 flex flex-col justify-center items-center text-muted">
        <svg class="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-lg">Result not found.</p>
        <a routerLink="/results" class="mt-4 text-brand hover:underline">← Back to Results</a>
      </div>

      <ng-container *ngIf="!loading && result">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6 shrink-0">
          <div>
            <a routerLink="/results" class="text-brand-light text-sm hover:underline mb-2 inline-block">← Back to Results</a>
            <h2 class="text-2xl font-bold text-main flex items-center gap-3">
              {{ result.relationships.assessment?.attributes?.title || 'Assessment Result' }}
              <span class="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 font-medium border border-slate-600">v{{ result.attributes.result_version }}</span>
            </h2>
            <p class="text-muted text-sm mt-1">
              Candidate: <span class="text-main font-medium">{{ result.relationships.candidate?.attributes?.first_name }} {{ result.relationships.candidate?.attributes?.last_name }}</span>
              <span class="mx-2 text-slate-600">•</span>
              Evaluated on: {{ result.attributes.scored_at | date:'medium' }}
            </p>
          </div>
          <div class="flex gap-3">
            <a [routerLink]="['/results', result.id, 'versions']" class="px-4 py-2 border border-border bg-input-bg text-main text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors">
              Version History
            </a>
            <button class="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors">
              Download PDF
            </button>
          </div>
        </div>

        <!-- Score Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="glass-card p-6 border-t-4 border-t-brand">
            <p class="text-muted text-sm font-medium">Final Score</p>
            <h3 class="text-4xl font-bold text-main mt-2">{{ result.attributes.percentage_score | number:'1.0-1' }}%</h3>
            <p class="text-xs text-muted mt-2">Raw Score: {{ result.attributes.total_score }}</p>
          </div>

          <div class="glass-card p-6 border-t-4" [ngClass]="result.attributes.is_passed ? 'border-t-emerald-500' : 'border-t-rose-500'">
            <p class="text-muted text-sm font-medium">Status</p>
            <h3 class="text-3xl font-bold mt-2" [ngClass]="result.attributes.is_passed ? 'text-emerald-400' : 'text-rose-400'">
              {{ result.attributes.is_passed ? 'PASSED' : 'FAILED' }}
            </h3>
            <p class="text-xs text-muted mt-2 text-transform: capitalize">{{ result.attributes.status.toLowerCase() }}</p>
          </div>

          <div class="glass-card p-6">
             <p class="text-muted text-sm font-medium">Competency Proficiency</p>
             <!-- Mocked progress bar for visual flair -->
             <div class="flex items-end gap-2 mt-4">
                <div class="flex-1">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-main">Overall Match</span>
                    <span class="text-accent-light">{{ result.attributes.percentage_score | number:'1.0-0' }}%</span>
                  </div>
                  <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-accent rounded-full" [style.width.%]="result.attributes.percentage_score"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Details Tabs placeholder -->
        <div class="glass-card flex-1 p-6">
          <h3 class="text-lg font-bold text-main border-b border-border pb-4 mb-4">Detailed Breakdown</h3>
          <div class="flex flex-col items-center justify-center text-muted py-12">
            <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p>Section and question level breakdowns will appear here.</p>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ResultDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  result: AssessmentResultDetail | null = null;
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.fetchResult(uuid);
      } else {
        this.loading = false;
      }
    });
  }

  fetchResult(uuid: string) {
    this.http.get<{success: boolean, data: AssessmentResultDetail}>(`${environment.apiUrl}/results/${uuid}`)
      .subscribe({
        next: (res) => {
          this.result = res.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching result detail', err);
          this.loading = false;
        }
      });
  }
}