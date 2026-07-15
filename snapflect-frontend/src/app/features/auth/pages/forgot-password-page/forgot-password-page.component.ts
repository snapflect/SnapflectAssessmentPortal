import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';
import { AuthFacade } from '../../facades/auth.facade';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ForgotPasswordFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-page text-main p-4">
      <div class="w-full max-w-md">
        <!-- Logo Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light mb-2">
            Reset Password
          </h1>
          <p class="text-muted">Enter your email to receive a reset link</p>
        </div>
        
        <div *ngIf="successMessage" class="glass-card p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">Check your email</h2>
          <p class="text-muted mb-6">{{ successMessage }}</p>
          <a href="/auth/login" class="btn-primary inline-flex justify-center items-center h-11 px-8">Return to Login</a>
        </div>

        <app-forgot-password-form *ngIf="!successMessage" (submitEmail)="onSubmit($event)"></app-forgot-password-form>
        
        <div class="mt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Snapflect Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordPageComponent {
  private authFacade = inject(AuthFacade);
  private toastService = inject(ToastService);
  
  @ViewChild(ForgotPasswordFormComponent) formComponent!: ForgotPasswordFormComponent;
  
  successMessage: string | null = null;

  onSubmit(email: string) {
    this.authFacade.forgotPassword(email).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'If your email address exists in our database, you will receive a password recovery link.';
      },
      error: (err) => {
        if (this.formComponent) {
          this.formComponent.submitting = false;
        }
        const msg = err?.error?.message || 'Failed to process request.';
        this.toastService.error('Error', msg);
      }
    });
  }
}