import { Component, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoginRequestModel } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login-form',
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
        <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="mt-2 text-sm text-danger">
          Please enter a valid email address.
        </p>
      </div>

      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <label for="password" class="block text-sm font-medium text-muted">Password</label>
          <a routerLink="/auth/forgot-password" class="text-sm font-medium text-brand-light hover:text-main transition-colors">Forgot password?</a>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <input id="password" type="password" formControlName="password" class="input-field pl-10" placeholder="••••••••" />
        </div>
        <p *ngIf="form.get('password')?.touched && form.get('password')?.invalid" class="mt-2 text-sm text-danger">
          Password is required.
        </p>
      </div>

      <div *ngIf="errorMessage()" class="mb-6 bg-danger/10 text-danger border border-danger/20 p-3 rounded-md text-sm">
        {{ errorMessage() }}
      </div>

      <button type="submit" [disabled]="form.invalid" class="w-full btn-primary flex justify-center items-center h-11">
        Sign In
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </form>
  `,
  styles: []
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  submitLogin = output<LoginRequestModel>();
  errorMessage = input<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.valid) {
      this.submitLogin.emit(this.form.getRawValue());
    }
  }
}