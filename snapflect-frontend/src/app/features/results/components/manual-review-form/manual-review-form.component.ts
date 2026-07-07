import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-manual-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="score">Score</label>
        <input id="score" type="number" formControlName="score">
      </div>
      <div>
        <label for="feedback">Feedback</label>
        <textarea id="feedback" formControlName="feedback"></textarea>
      </div>
      <button type="submit" [disabled]="reviewForm.invalid || isSubmitting">
        {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
      </button>
    </form>
  `
})
export class ManualReviewFormComponent {
  @Input() resultId?: string;
  @Input() isSubmitting = false;
  @Output() submitReview = new EventEmitter<{resultId: string, score: number, feedback: string}>();

  reviewForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      score: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      feedback: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.reviewForm.valid && this.resultId) {
      this.submitReview.emit({
        resultId: this.resultId,
        score: this.reviewForm.value.score,
        feedback: this.reviewForm.value.feedback
      });
    }
  }
}