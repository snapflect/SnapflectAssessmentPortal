import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeliveryStore } from '../../../store/delivery.store';

@Component({
  selector: 'app-attempt-submission-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="completion-page">
      <div class="completion-card">
        <div class="success-icon">✅</div>
        <h1 class="completion-title">Assessment Submitted!</h1>
        <p class="completion-subtitle">Your answers have been successfully submitted and recorded.</p>

        <div class="details-grid">
          <div class="detail-row">
            <span class="detail-label">Attempt ID</span>
            <span class="detail-value">{{ store.attemptUuid() ?? '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Completion</span>
            <span class="detail-value">{{ store.completionPercentage() | number:'1.0-0' }}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value status-submitted">SUBMITTED</span>
          </div>
        </div>

        <div class="notice-box">
          🔒 This attempt is now locked. Further edits are not permitted.
        </div>

        <div class="completion-actions">
          <button class="btn btn-primary" (click)="goToDashboard()">
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .completion-page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4 0%, #f5f7fa 100%); display: flex; align-items: center; justify-content: center; padding: 32px; }
    .completion-card { background: #fff; border-radius: 24px; padding: 56px 48px; max-width: 560px; width: 100%; box-shadow: 0 8px 40px rgba(0,0,0,0.08); text-align: center; }
    .success-icon { font-size: 64px; margin-bottom: 16px; }
    .completion-title { font-size: 30px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .completion-subtitle { font-size: 16px; color: #64748b; margin-bottom: 40px; }
    .details-grid { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; }
    .detail-label { font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1e293b; font-family: monospace; }
    .status-submitted { background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 99px; font-family: sans-serif; font-size: 12px; }
    .notice-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 14px 18px; color: #166534; font-size: 13px; margin-bottom: 32px; }
    .completion-actions { display: flex; justify-content: center; }
    .btn { padding: 14px 32px; border-radius: 12px; border: none; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.15s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #4f46e5; box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
  `]
})
export class AttemptSubmissionPageComponent {
  protected store = inject(DeliveryStore);
  private router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/delivery/dashboard']);
  }
}