import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="glass-card p-8">
      <div class="mb-6">
        <label for="email" class="block text-sm font-medium text-muted mb-2">Email Address</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <input id="email" type="email" formControlName="email" class="input-field pl-10" placeholder="you@example.com" />
        </div>
        <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="mt-2 text-sm text-red-400">
          Please enter a valid email address.
        </p>
      </div>

      <button type="submit" [disabled]="form.invalid || submitting" class="w-full btn-primary flex justify-center items-center h-11 mb-4">
        <span *ngIf="!submitting">Send Reset Link</span>
        <span *ngIf="submitting">Sending...</span>
      </button>
      
      <div class="text-center mt-6">
        <a routerLink="/auth/login" class="text-sm font-medium text-brand-light hover:text-main transition-colors flex items-center justify-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to login
        </a>
      </div>
    </form>
  `
})
export class ForgotPasswordFormComponent {
  private fb = inject(FormBuilder);
  submitEmail = output<string>();
  submitting = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (this.form.valid) {
      this.submitting = true;
      this.submitEmail.emit(this.form.getRawValue().email);
    }
  }
}