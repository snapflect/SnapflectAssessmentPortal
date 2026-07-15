import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordFormComponent } from '../../components/reset-password-form/reset-password-form.component';
import { AuthFacade } from '../../facades/auth.facade';
import { ToastService } from '../../../../core/services/toast.service';
import { ResetPasswordRequestModel } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ResetPasswordFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-page text-main p-4">
      <div class="w-full max-w-md">
        <!-- Logo Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light mb-2">
            Set New Password
          </h1>
          <p class="text-muted">Enter your new password below</p>
        </div>
        
        <div *ngIf="missingParams" class="glass-card p-8 text-center text-danger">
          <p>Invalid password reset link. Please request a new one.</p>
          <a href="/auth/forgot-password" class="btn-primary inline-flex justify-center items-center h-11 px-8 mt-4 text-white">Go to Forgot Password</a>
        </div>

        <app-reset-password-form *ngIf="!missingParams" (submitForm)="onSubmit($event)" [errorMessage]="resetError"></app-reset-password-form>
        
        <div class="mt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Snapflect Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authFacade = inject(AuthFacade);
  private toastService = inject(ToastService);
  
  @ViewChild(ResetPasswordFormComponent) formComponent!: ResetPasswordFormComponent;

  token: string = '';
  email: string = '';
  missingParams = false;
  resetError: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
      
      if (!this.token || !this.email) {
        this.missingParams = true;
      }
    });
  }

  onSubmit(data: {password: string; password_confirmation: string}) {
    this.resetError = null;
    const payload: ResetPasswordRequestModel = {
      email: this.email,
      token: this.token,
      password: data.password,
      password_confirmation: data.password_confirmation
    };

    this.authFacade.resetPassword(payload).subscribe({
      next: (res) => {
        this.toastService.success('Password Reset', res.message || 'Your password has been successfully reset.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        if (this.formComponent) {
          this.formComponent.submitting = false;
        }
        
        if (err?.error?.detail) {
          if (typeof err.error.detail === 'string') {
            this.resetError = err.error.detail;
          } else if (typeof err.error.detail === 'object') {
            const keys = Object.keys(err.error.detail);
            if (keys.length > 0) {
              this.resetError = err.error.detail[keys[0]][0];
            }
          }
        } else if (err?.error?.message) {
          this.resetError = err.error.message;
        } else {
          this.resetError = 'Failed to reset password. The link might be expired.';
        }
      }
    });
  }
}