import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DeliveryStore } from '../../../store/delivery.store';
import { DeliveryFacade } from '../../../facades/delivery.facade';

@Component({
  selector: 'app-attempt-summary-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-page">
      <div class="summary-card">
        <h1 class="summary-title">Assessment Summary</h1>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ answeredCount() }}</span>
            <span class="stat-label">Answered</span>
          </div>
          <div class="stat-item stat-unanswered">
            <span class="stat-value">{{ unansweredCount() }}</span>
            <span class="stat-label">Unanswered</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.completionPercentage() | number:'1.0-0' }}%</span>
            <span class="stat-label">Complete</span>
          </div>
          <div class="stat-item">
            <span class="stat-value timer" [class.expired]="store.expired()">{{ formattedTime() }}</span>
            <span class="stat-label">Remaining</span>
          </div>
        </div>

        @if (unansweredCount() > 0 && !store.expired()) {
          <div class="warning-banner">
            ⚠️ You have {{ unansweredCount() }} unanswered question(s). You can go back to answer them.
          </div>
        }

        @if (store.expired()) {
          <div class="expired-banner">
            🕐 Your session has expired. You must submit your answers now.
          </div>
        }

        <div class="summary-actions">
          @if (!store.expired() && !isSubmitted()) {
            <button class="btn btn-secondary" (click)="goBack()">
              ← Review Questions
            </button>
          }
          @if (!isSubmitted()) {
            <button
              class="btn btn-submit"
              [disabled]="store.submissionState() === 'SUBMITTING'"
              (click)="submit()">
              @if (store.submissionState() === 'SUBMITTING') {
                <span class="spinner"></span> Submitting...
              } @else {
                Submit Assessment ✓
              }
            </button>
          }
          @if (isSubmitted()) {
            <div class="submitted-notice">✅ Your assessment has been submitted.</div>
          }
        </div>

        @if (store.submissionState() === 'ERROR') {
          <div class="error-banner">❌ Submission failed. Please try again.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .summary-page { min-height: 100vh; background: #f5f7fa; display: flex; align-items: center; justify-content: center; padding: 32px; }
    .summary-card { background: #fff; border-radius: 20px; padding: 48px; max-width: 640px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .summary-title { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 32px; text-align: center; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .stat-item { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-item.stat-unanswered { background: #fff7ed; }
    .stat-value { display: block; font-size: 32px; font-weight: 700; color: #1e293b; }
    .stat-value.timer { font-variant-numeric: tabular-nums; }
    .stat-value.expired { color: #ef4444; }
    .stat-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-top: 4px; }
    .warning-banner { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 14px 18px; color: #9a3412; margin-bottom: 24px; font-size: 14px; }
    .expired-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; margin-bottom: 24px; font-size: 14px; font-weight: 600; }
    .error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; margin-top: 16px; font-size: 14px; text-align: center; }
    .summary-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 14px 28px; border-radius: 12px; border: none; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
    .btn-submit { background: #6366f1; color: #fff; }
    .btn-submit:hover:not(:disabled) { background: #4f46e5; box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
    .submitted-notice { padding: 14px 24px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; color: #166534; font-weight: 600; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AttemptSummaryPageComponent {
  protected store = inject(DeliveryStore);
  private facade = inject(DeliveryFacade);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected isSubmitted = computed(() => this.store.status() === 'SUBMITTED');

  protected answeredCount = computed(() =>
    (this.store.draftAnswers() as any[]).length
  );

  protected unansweredCount = computed(() =>
    this.store.questionOrder().length - this.answeredCount()
  );

  protected formattedTime = computed(() => {
    const secs = this.store.remainingSeconds();
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  goBack() {
    const uuid = this.store.attemptUuid();
    if (uuid) this.router.navigate(['../../', uuid], { relativeTo: this.route });
  }

  submit() {
    this.facade.submitAttempt()?.subscribe({
      next: (res) => {
        if (res) {
          const uuid = this.store.attemptUuid();
          if (uuid) this.router.navigate(['..', 'submission'], { relativeTo: this.route });
        }
      }
    });
  }
}