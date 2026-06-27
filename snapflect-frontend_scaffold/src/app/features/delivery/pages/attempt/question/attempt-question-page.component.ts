import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DeliveryStore } from '../../../store/delivery.store';
import { DeliveryFacade } from '../../../facades/delivery.facade';

@Component({
  selector: 'app-attempt-question-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="attempt-page" [class.locked]="isSubmitted()">

      <!-- Timer Bar -->
      <header class="timer-bar">
        <div class="timer-info">
          <span class="timer-label">Time Remaining</span>
          <span class="timer-value" [class.expired]="store.expired()">
            {{ formattedTime() }}
          </span>
        </div>
        <div class="progress-info">
          <span>{{ store.completionPercentage() | number:'1.0-0' }}% Complete</span>
        </div>
        <div class="status-badge" [ngClass]="'status-' + (store.status() ?? 'active' | lowercase)">
          {{ store.status() ?? 'ACTIVE' }}
        </div>
      </header>

      <!-- Expiration Warning -->
      @if (store.expired() && !isSubmitted()) {
        <div class="expiry-banner">
          ⚠️ Your session has expired. Please submit your answers now.
        </div>
      }

      <!-- Question Navigation -->
      <aside class="question-nav">
        @for (qUuid of store.questionOrder(); track qUuid; let i = $index) {
          <button
            class="nav-item"
            [class.active]="currentIndex() === i"
            [class.answered]="isAnswered(qUuid)"
            (click)="navigateTo(i)">
            {{ i + 1 }}
          </button>
        }
      </aside>

      <!-- Question Panel -->
      <main class="question-panel">
        @if (currentQuestion(); as qUuid) {
          <div class="question-card">
            <div class="question-number">Question {{ currentIndex() + 1 }} of {{ store.questionOrder().length }}</div>
            <div class="question-body">{{ getQuestionLabel(qUuid) }}</div>

            <!-- Options (radio or checkbox based on question type) -->
            <div class="options-list">
              @for (optUuid of currentOptions(); track optUuid) {
                <label class="option-item" [class.disabled]="isSubmitted()">
                  @if (currentQuestionType() === 'multiple_choice') {
                    <input
                      type="checkbox"
                      [name]="qUuid"
                      [value]="optUuid"
                      [checked]="isOptionSelected(qUuid, optUuid)"
                      [disabled]="isSubmitted() || store.expired()"
                      (change)="onMultiAnswerChange(qUuid, optUuid, $any($event.target).checked)" />
                  } @else {
                    <input
                      type="radio"
                      [name]="qUuid"
                      [value]="optUuid"
                      [checked]="isOptionSelected(qUuid, optUuid)"
                      [disabled]="isSubmitted() || store.expired()"
                      (change)="onAnswerChange(qUuid, optUuid)" />
                  }
                  <span class="option-label">{{ getOptionLabel(optUuid) }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="question-actions">
            <button class="btn btn-secondary" [disabled]="currentIndex() === 0" (click)="prev()">
              ← Previous
            </button>
            @if (currentIndex() < store.questionOrder().length - 1) {
              <button class="btn btn-primary" (click)="next()">
                Next →
              </button>
            } @else {
              <button class="btn btn-summary" (click)="goToSummary()">
                Review Summary
              </button>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .attempt-page { display: grid; grid-template-rows: auto 1fr; grid-template-columns: 80px 1fr; min-height: 100vh; background: #f5f7fa; }
    .attempt-page.locked { pointer-events: none; opacity: 0.7; }
    .timer-bar { grid-column: 1/-1; display: flex; align-items: center; gap: 24px; padding: 12px 24px; background: #1e293b; color: #fff; }
    .timer-label { font-size: 12px; text-transform: uppercase; opacity: 0.6; }
    .timer-value { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .timer-value.expired { color: #ef4444; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .progress-info { margin-left: auto; font-size: 14px; opacity: 0.8; }
    .status-badge { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-active { background: #22c55e22; color: #22c55e; }
    .status-expired { background: #ef444422; color: #ef4444; }
    .status-submitted { background: #3b82f622; color: #3b82f6; }
    .expiry-banner { grid-column: 1/-1; background: #fef2f2; border-bottom: 2px solid #ef4444; color: #991b1b; padding: 12px 24px; font-weight: 600; text-align: center; }
    .question-nav { background: #fff; border-right: 1px solid #e2e8f0; padding: 16px 8px; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
    .nav-item { width: 44px; height: 44px; border-radius: 8px; border: 2px solid #e2e8f0; background: #f8fafc; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.15s; }
    .nav-item.active { border-color: #6366f1; background: #6366f1; color: #fff; }
    .nav-item.answered { border-color: #22c55e; background: #f0fdf4; }
    .question-panel { padding: 32px; overflow-y: auto; }
    .question-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px; }
    .question-number { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 12px; }
    .question-body { font-size: 18px; font-weight: 500; color: #1e293b; line-height: 1.6; margin-bottom: 24px; }
    .options-list { display: flex; flex-direction: column; gap: 10px; }
    .option-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 10px; border: 2px solid #e2e8f0; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
    .option-item:hover:not(.disabled) { border-color: #6366f1; background: #f5f3ff; }
    .option-item.disabled { cursor: not-allowed; opacity: 0.6; }
    .option-item input { accent-color: #6366f1; }
    .option-label { font-size: 15px; color: #334155; }
    .question-actions { display: flex; justify-content: space-between; gap: 12px; }
    .btn { padding: 12px 24px; border-radius: 10px; border: none; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.15s; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
    .btn-summary { background: #0ea5e9; color: #fff; }
    .btn-summary:hover:not(:disabled) { background: #0284c7; }
  `]
})
export class AttemptQuestionPageComponent implements OnDestroy {
  protected store = inject(DeliveryStore);
  private facade = inject(DeliveryFacade);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected currentIndex = signal(0);
  private draftVersion = signal(1);

  protected isSubmitted = computed(() => this.store.status() === 'SUBMITTED');

  protected currentQuestion = computed(() => {
    const order = this.store.questionOrder();
    return order[this.currentIndex()] ?? null;
  });

  protected currentOptions = computed(() => {
    const qUuid = this.currentQuestion();
    if (!qUuid) return [];
    return this.store.optionOrder()[qUuid] ?? [];
  });

  protected formattedTime = computed(() => {
    const secs = this.store.remainingSeconds();
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  navigateTo(index: number) { this.currentIndex.set(index); }
  prev() { this.currentIndex.update(i => Math.max(0, i - 1)); }
  next() { this.currentIndex.update(i => Math.min(this.store.questionOrder().length - 1, i + 1)); }

  goToSummary() {
    const uuid = this.store.attemptUuid();
    if (uuid) this.router.navigate(['..', uuid, 'summary'], { relativeTo: this.route });
  }

  onAnswerChange(questionUuid: string, answerValue: string) {
    if (this.isSubmitted() || this.store.expired()) return;
    const version = this.draftVersion();
    this.draftVersion.update(v => v + 1);
    this.store.updateDraftAnswer(questionUuid, answerValue);
    this.facade.autoSave(questionUuid, version.toString(), answerValue);
  }

  onMultiAnswerChange(questionUuid: string, optUuid: string, isChecked: boolean) {
    if (this.isSubmitted() || this.store.expired()) return;

    let currentAnswer = this.getDraftAnswer(questionUuid);
    let newAnswer: string[] = [];

    if (Array.isArray(currentAnswer)) {
      newAnswer = [...currentAnswer];
    } else if (currentAnswer) {
      newAnswer = [currentAnswer];
    }

    if (isChecked) {
      if (!newAnswer.includes(optUuid)) newAnswer.push(optUuid);
    } else {
      newAnswer = newAnswer.filter(id => id !== optUuid);
    }

    const version = this.draftVersion();
    this.draftVersion.update(v => v + 1);
    this.store.updateDraftAnswer(questionUuid, newAnswer);
    this.facade.autoSave(questionUuid, version.toString(), newAnswer);
  }

  isOptionSelected(qUuid: string, optUuid: string): boolean {
    const answer = this.getDraftAnswer(qUuid);
    if (Array.isArray(answer)) {
      return answer.includes(optUuid);
    }
    return answer === optUuid;
  }

  isAnswered(qUuid: string): boolean {
    const answer = this.getDraftAnswer(qUuid);
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer !== null && answer !== undefined;
  }

  getDraftAnswer(qUuid: string): any {
    const drafts = this.store.draftAnswers() as any[];
    const found = drafts.find(d => d.questionUuid === qUuid || d.question_uuid === qUuid);
    return found?.answerPayload ?? found?.answer_payload ?? null;
  }

  // Labels resolved from server-side SnapshotMap — no UUID exposure to candidates
  getQuestionLabel(uuid: string): string {
    return this.store.snapshotMap()?.questions[uuid]?.text ?? uuid;
  }

  getOptionLabel(uuid: string): string {
    return this.store.snapshotMap()?.options[uuid] ?? uuid;
  }

  currentQuestionType = computed(() => {
    const qUuid = this.currentQuestion();
    if (!qUuid) return 'single_choice';
    return this.store.snapshotMap()?.questions[qUuid]?.type ?? 'single_choice';
  });

  ngOnDestroy() {}
}