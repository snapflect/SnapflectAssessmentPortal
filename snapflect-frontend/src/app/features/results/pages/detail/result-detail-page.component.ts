import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../core/services/toast.service';

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
            <button 
              class="px-4 py-2 text-sm font-semibold rounded-md transition-colors"
              [ngClass]="result.attributes.is_passed ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'"
              [disabled]="!result.attributes.is_passed"
              (click)="downloadCertificate(result)">
              Download Certificate Pdf
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

        <!-- Detailed Breakdown -->
        <div class="glass-card flex-1 p-6 flex flex-col min-h-[400px]">
          <div class="border-b border-border flex gap-6 mb-6">
            <button class="pb-3 text-sm font-bold border-b-2 transition-colors" [ngClass]="activeTab === 'competencies' ? 'border-brand text-brand-light' : 'border-transparent text-muted hover:text-main'" (click)="activeTab = 'competencies'">Competencies</button>
            <button class="pb-3 text-sm font-bold border-b-2 transition-colors" [ngClass]="activeTab === 'sections' ? 'border-brand text-brand-light' : 'border-transparent text-muted hover:text-main'" (click)="activeTab = 'sections'">Sections</button>
            <button class="pb-3 text-sm font-bold border-b-2 transition-colors" [ngClass]="activeTab === 'questions' ? 'border-brand text-brand-light' : 'border-transparent text-muted hover:text-main'" (click)="activeTab = 'questions'">Questions</button>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
            
            <!-- Competencies Tab -->
            <div *ngIf="activeTab === 'competencies'">
              <div *ngIf="!result.relationships.competency_scores?.length" class="text-center text-muted py-8">
                <p>No competency breakdown available.</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let comp of result.relationships.competency_scores" class="p-4 border border-border/50 bg-surface/30 rounded-xl">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-main font-semibold text-sm">{{ comp.attributes.competency_name || 'Competency Score' }}</span>
                    <span class="text-brand-light font-bold text-sm">{{ comp.attributes.competency_percentage | number:'1.0-0' }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-brand-light rounded-full" [style.width.%]="comp.attributes.competency_percentage"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sections Tab -->
            <div *ngIf="activeTab === 'sections'">
              <div *ngIf="!result.relationships.section_scores?.length" class="text-center text-muted py-8">
                <p>No section breakdown available.</p>
              </div>
              <div class="space-y-4">
                <div *ngFor="let sec of result.relationships.section_scores" class="p-4 border border-border/50 bg-surface/30 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 class="text-main font-semibold text-sm mb-1">{{ sec.attributes.section_name || 'Assessment Section' }}</h4>
                    <p class="text-xs text-muted">Weight: {{ sec.attributes.section_weight }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-brand-light font-bold">{{ sec.attributes.section_percentage | number:'1.0-0' }}%</div>
                    <div class="text-xs text-slate-500">{{ sec.attributes.section_score }} Points</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Questions Tab -->
            <div *ngIf="activeTab === 'questions'">
              <div *ngIf="!result.relationships.question_scores?.length" class="text-center text-muted py-8">
                <p>No question breakdown available.</p>
              </div>
              <div class="space-y-3">
                <div *ngFor="let q of result.relationships.question_scores; let i = index" class="p-4 border border-border/50 bg-surface/30 rounded-xl flex items-center gap-4">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" 
                       [ngClass]="q.attributes.percentage === 100 ? 'bg-emerald-500/20 text-emerald-400' : (q.attributes.percentage > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400')">
                    <span class="text-xs font-bold">Q{{i + 1}}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between mb-1">
                      <span class="text-main font-medium text-sm">{{ q.attributes.question_text || 'Question Evaluation' }}</span>
                      <span class="text-sm font-semibold" 
                            [ngClass]="q.attributes.percentage === 100 ? 'text-emerald-400' : (q.attributes.percentage > 0 ? 'text-amber-400' : 'text-rose-400')">
                        {{ q.attributes.awarded_score }} / {{ q.attributes.max_score }}
                      </span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" 
                           [ngClass]="q.attributes.percentage === 100 ? 'bg-emerald-400' : (q.attributes.percentage > 0 ? 'bg-amber-400' : 'bg-rose-400')"
                           [style.width.%]="q.attributes.percentage"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
  activeTab: 'competencies' | 'sections' | 'questions' = 'questions';

  private toastService = inject(ToastService);

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

  downloadCertificate(result: AssessmentResultDetail) {
    if (!result.attributes.is_passed) return;
    this.http.get<any>(`${environment.apiUrl}/candidates/results/${result.id}/certificate/download`)
      .subscribe({
        next: (res) => {
          if (res.data && res.data.html) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
              newWindow.document.open();
              newWindow.document.write(res.data.html);
              newWindow.document.close();
            }
          }
        },
        error: (err) => {
          console.error('Error downloading certificate', err);
          this.toastService.warning('Not Available', 'Certificate not available for this result.');
        }
      });
  }
}