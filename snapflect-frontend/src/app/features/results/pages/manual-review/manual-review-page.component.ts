import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface PendingReview {
  uuid: string;
  attributes: {
    question_text: string;
    candidate_answer: string;
    max_score: number;
    awarded_score?: number;
    status: string;
    notes?: string;
  };
  relationships?: {
    result?: {
      uuid: string;
      relationships?: {
        candidate?: { attributes: { first_name: string; last_name: string } };
        assessment?: { attributes: { title: string } };
      };
    };
    question?: { attributes: { question_code: string; question_text: string } };
  };
}

@Component({
  selector: 'app-manual-review-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Manual Scoring</h2>
          <p class="text-muted text-sm mt-1">Review essay and subjective answers requiring human evaluation.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500 hover:brightness-110 px-3 py-1.5 rounded-lg border border-border-light">
            <span class="text-amber-400 font-bold">{{ pendingReviews.length }}</span> pending
          </span>
        </div>
      </div>

      <div *ngIf="loading" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="!loading && pendingReviews.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600">
        <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-xl">All caught up!</p>
        <p class="text-sm mt-2">No pending manual reviews.</p>
      </div>

      <!-- Split Pane Layout -->
      <div *ngIf="!loading && pendingReviews.length > 0" class="flex-1 flex gap-5 overflow-hidden">

        <!-- Left: Review Queue -->
        <div class="w-80 flex flex-col flex-shrink-0">
          <div class="glass-card flex-1 overflow-hidden flex flex-col">
            <div class="px-4 py-3 border-b border-border-light bg-input-bg">
              <h3 class="text-sm font-semibold text-muted uppercase tracking-wider">Review Queue</h3>
            </div>
            <div class="overflow-y-auto flex-1 p-2 space-y-1">
              <button *ngFor="let review of pendingReviews; let i = index"
                      (click)="selectReview(review)"
                      class="w-full text-left p-3 rounded-lg transition-all border"
                      [ngClass]="activeReview?.uuid === review.uuid
                        ? 'bg-brand/10 border-brand/30'
                        : 'bg-white/3 border-white/5 hover:hover:brightness-110'">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                  <span class="text-xs px-1.5 py-0.5 rounded uppercase font-bold"
                        [ngClass]="review.attributes.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'">
                    {{ review.attributes.status }}
                  </span>
                </div>
                <p class="text-main text-xs font-medium leading-tight line-clamp-2">
                  {{ review.relationships?.result?.relationships?.candidate?.attributes?.first_name }}
                  {{ review.relationships?.result?.relationships?.candidate?.attributes?.last_name }}
                </p>
                <p class="text-slate-600 text-xs mt-0.5 line-clamp-1">
                  {{ review.relationships?.result?.relationships?.assessment?.attributes?.title }}
                </p>
                <div class="text-xs text-slate-600 mt-1">Max: {{ review.attributes.max_score }} pts</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Grading Panel -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div *ngIf="!activeReview" class="flex-1 glass-card flex items-center justify-center text-slate-600">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
              </svg>
              <p>Select a review from the queue to start grading</p>
            </div>
          </div>

          <div *ngIf="activeReview" class="flex-1 flex flex-col gap-4 overflow-hidden">

            <!-- Candidate & Assessment Info -->
            <div class="glass-card p-4 flex items-center gap-4 flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand/40 to-brand-light/40 flex items-center justify-center text-main font-bold text-sm">
                {{ getInitials(activeReview) }}
              </div>
              <div class="flex-1">
                <p class="text-main font-semibold">
                  {{ activeReview.relationships?.result?.relationships?.candidate?.attributes?.first_name }}
                  {{ activeReview.relationships?.result?.relationships?.candidate?.attributes?.last_name }}
                </p>
                <p class="text-slate-500 text-xs">{{ activeReview.relationships?.result?.relationships?.assessment?.attributes?.title }}</p>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500">Max Score</span>
                <div class="text-lg font-bold text-main">{{ activeReview.attributes.max_score }}</div>
              </div>
            </div>

            <!-- Split Content Area -->
            <div class="flex-1 grid grid-cols-2 gap-4 overflow-hidden">

              <!-- Left: Question + Candidate Answer -->
              <div class="flex flex-col gap-3 overflow-hidden">
                <div class="glass-card p-4 flex-shrink-0">
                  <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Question</h4>
                  <div class="text-main text-sm leading-relaxed" [innerHTML]="activeReview.attributes.question_text"></div>
                </div>
                <div class="glass-card p-4 flex-1 overflow-y-auto">
                  <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Candidate Answer</h4>
                  <div class="text-muted text-sm leading-relaxed whitespace-pre-wrap">{{ activeReview.attributes.candidate_answer || 'No answer provided.' }}</div>
                </div>
              </div>

              <!-- Right: Grading Panel -->
              <div class="flex flex-col gap-3 overflow-y-auto pr-1">
                <div class="glass-card p-5 flex-shrink-0">
                  <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Scoring Panel</h4>

                  <form [formGroup]="scoreForm" (ngSubmit)="submitScore()" class="space-y-4">

                    <!-- Score Slider -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm text-muted">Awarded Score</label>
                        <span class="text-brand-light font-bold bg-input-bg border border-border-light rounded px-3 py-1">
                          {{ scoreForm.get('awarded_score')?.value | number:'1.1-2' }} <span class="text-muted ml-1">/ {{ activeReview.attributes.max_score }}</span>
                        </span>
                      </div>
                      <input type="range"
                             formControlName="awarded_score"
                             [min]="0" [max]="activeReview.attributes.max_score" [step]="getStepSize()"
                             class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand">

                      <!-- Visual score bar -->
                      <div class="mt-2 h-2 hover:brightness-110 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all"
                             [style.width.%]="getScorePct()"></div>
                      </div>
                    </div>

                    <!-- Reviewer Notes -->
                    <div>
                      <label class="block text-sm text-muted mb-1">Reviewer Notes</label>
                      <textarea formControlName="notes" class="input-field h-24 resize-none text-sm" placeholder="Add notes for candidate feedback or internal records..."></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                      <button type="submit" class="flex-1 btn-primary" [disabled]="scoreForm.invalid || submitting">
                        {{ submitting ? 'Saving...' : 'Submit Score' }}
                      </button>
                      <button type="button" class="btn-secondary px-4" (click)="skipReview()">Skip</button>
                    </div>
                  </form>
                </div>

                <!-- Scoring Guide -->
                <div class="glass-card p-4 flex-shrink-0">
                  <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Grading Guide</h4>
                  <div class="space-y-3">
                    <div *ngFor="let guide of gradingGuide" class="flex items-start gap-3">
                      <div class="flex flex-col flex-shrink-0 w-20">
                        <span class="text-brand-light text-xs font-bold">{{ getPointRange(guide) }}</span>
                        <span class="text-slate-500 text-[10px]">{{ guide.pct }}</span>
                      </div>
                      <span class="text-slate-400 text-xs leading-relaxed">{{ guide.description }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManualReviewPageComponent implements OnInit {
  pendingReviews: PendingReview[] = [];
  activeReview: PendingReview | null = null;
  loading = true;
  submitting = false;
  currentResultUuid = '';

  scoreForm: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  gradingGuide = [
    { pct: '90-100%', min: 0.90, max: 1.00, description: 'Exceptional — comprehensive, accurate, well-structured answer.' },
    { pct: '70-89%', min: 0.70, max: 0.89, description: 'Good — covers main points with minor gaps.' },
    { pct: '50-69%', min: 0.50, max: 0.69, description: 'Satisfactory — demonstrates basic understanding.' },
    { pct: '25-49%', min: 0.25, max: 0.49, description: 'Poor — significant gaps in knowledge.' },
    { pct: '0-24%', min: 0.00, max: 0.24, description: 'Failing — incorrect or largely incomplete.' },
  ];

  constructor() {
    this.scoreForm = this.fb.group({
      awarded_score: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit() { this.fetchPendingReviews(); }

  getStepSize(): number {
    if (!this.activeReview) return 1;
    const max = this.activeReview.attributes.max_score;
    if (max <= 5) return 0.1;
    if (max <= 20) return 0.5;
    return 1;
  }

  getPointRange(guide: any): string {
    if (!this.activeReview) return guide.pct;
    const max = this.activeReview.attributes.max_score;
    const minPts = (max * guide.min).toFixed(1).replace(/\.0$/, '');
    const maxPts = (max * guide.max).toFixed(1).replace(/\.0$/, '');
    return `${minPts} - ${maxPts} pts`;
  }

  fetchPendingReviews() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/results/manual-reviews/pending`)
      .subscribe({
        next: (res) => {
          this.pendingReviews = res.data || [];
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  selectReview(review: PendingReview) {
    // Attempt to lock
    this.http.post<any>(`${environment.apiUrl}/results/manual-reviews/${review.uuid}/lock`, {})
      .subscribe({
        next: (res) => {
          this.activeReview = res.data || review;
          this.currentResultUuid = review.relationships?.result?.uuid || '';
          this.scoreForm.patchValue({
            awarded_score: this.activeReview?.attributes.awarded_score || 0,
            notes: this.activeReview?.attributes.notes || ''
          });
        },
        error: (err) => {
          console.error(err);
          if (err.status === 409) {
            alert('This item is currently being reviewed by someone else.');
            // Remove from local array
            const idx = this.pendingReviews.findIndex(r => r.uuid === review.uuid);
            if (idx > -1) {
              this.pendingReviews.splice(idx, 1);
              if (this.pendingReviews.length > 0) {
                this.selectReview(this.pendingReviews[0]);
              } else {
                this.activeReview = null;
              }
            }
          }
        }
      });
  }

  getInitials(review: PendingReview): string {
    const fn = review.relationships?.result?.relationships?.candidate?.attributes?.first_name || '';
    const ln = review.relationships?.result?.relationships?.candidate?.attributes?.last_name || '';
    return `${fn[0] || ''}${ln[0] || ''}`.toUpperCase();
  }

  getScorePct(): number {
    if (!this.activeReview) return 0;
    const score = this.scoreForm.get('awarded_score')?.value || 0;
    return (score / this.activeReview.attributes.max_score) * 100;
  }

  submitScore() {
    if (this.scoreForm.invalid || !this.activeReview) return;
    this.submitting = true;

    const payload = {
      reviewed_score: this.scoreForm.value.awarded_score,
      review_comments: this.scoreForm.value.notes,
      review_status: 'COMPLETED'
    };

    this.http.patch(`${environment.apiUrl}/results/manual-reviews/${this.activeReview.uuid}`, payload)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.activeReview = null;
          this.fetchPendingReviews();
        },
        error: (err) => { console.error(err); this.submitting = false; }
      });
  }

  skipReview() {
    if (!this.activeReview) return;
    this.activeReview = null;
    this.fetchPendingReviews();
  }
}