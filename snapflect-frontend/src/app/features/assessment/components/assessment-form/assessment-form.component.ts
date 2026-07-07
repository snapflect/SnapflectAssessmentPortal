import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStore } from '../../../../shared/stores/user.store';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="assessmentForm" (ngSubmit)="onSubmit()" class="assessment-form">
      <div>
        <label for="name">Name</label>
        <input id="name" type="text" formControlName="name" />
        <div *ngIf="assessmentForm.get('name')?.invalid && assessmentForm.get('name')?.touched" class="error-msg">
          Name is required
        </div>
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" formControlName="description"></textarea>
      </div>
      
      <div class="actions">
        <button 
          id="submit-btn" 
          type="submit" 
          [disabled]="assessmentForm.invalid || isReadOnly"
          *ngIf="canEdit">
          Save Assessment
        </button>

        <button 
          id="edit-btn" 
          type="button" 
          [disabled]="isReadOnly"
          *ngIf="canEdit">
          Edit
        </button>

        <button 
          id="delete-btn" 
          type="button" 
          (click)="onDelete()"
          *ngIf="canDelete">
          Delete Assessment
        </button>
      </div>
    </form>

    <div *ngIf="submitSuccess" id="success-msg">Assessment saved successfully!</div>
  `,
  styles: [`
    .assessment-form { display: flex; flex-direction: column; gap: 1rem; }
    .error-msg { color: red; font-size: 0.8rem; }
  `]
})
export class AssessmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userStore = inject(UserStore);

  public assessmentForm!: FormGroup;
  public submitSuccess = false;

  ngOnInit() {
    this.assessmentForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    if (this.isReadOnly) {
      this.assessmentForm.disable();
    }
  }

  get isReadOnly(): boolean {
    return this.userStore.hasAnyRole(['READ_ONLY']);
  }

  get canEdit(): boolean {
    return this.userStore.hasAnyRole(['PLATFORM_ADMIN', 'CLIENT_ADMIN', 'ASSESSMENT_MANAGER']);
  }

  get canDelete(): boolean {
    return this.userStore.hasAnyRole(['PLATFORM_ADMIN', 'CLIENT_ADMIN']);
  }

  onSubmit() {
    if (this.assessmentForm.valid && !this.isReadOnly) {
      this.submitSuccess = true;
    }
  }

  onDelete() {
    // Delete logic
  }
}