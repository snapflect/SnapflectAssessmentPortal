import { Component, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="glass-card p-8">
      
      <!-- New Password -->
      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-muted mb-2">New Password</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <input id="password" type="password" formControlName="password" class="input-field pl-10" placeholder="••••••••" />
        </div>
        <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('required')" class="mt-2 text-sm text-red-400">
          Password is required.
        </p>
        <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('minlength')" class="mt-2 text-sm text-red-400">
          Password must be at least 8 characters long.
        </p>
      </div>

      <!-- Confirm Password -->
      <div class="mb-8">
        <label for="password_confirmation" class="block text-sm font-medium text-muted mb-2">Confirm Password</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <input id="password_confirmation" type="password" formControlName="password_confirmation" class="input-field pl-10" placeholder="••••••••" />
        </div>
        <p *ngIf="form.get('password_confirmation')?.touched && form.hasError('mismatch')" class="mt-2 text-sm text-red-400">
          Passwords do not match.
        </p>
      </div>
      
      <div *ngIf="errorMessage()" class="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm">
        {{ errorMessage() }}
      </div>

      <button type="submit" [disabled]="form.invalid || submitting" class="w-full btn-primary flex justify-center items-center h-11">
        <span *ngIf="!submitting">Reset Password</span>
        <span *ngIf="submitting">Resetting...</span>
      </button>
    </form>
  `
})
export class ResetPasswordFormComponent {
  private fb = inject(FormBuilder);
  submitForm = output<{password: string; password_confirmation: string}>();
  errorMessage = input<string | null>(null);
  submitting = false;

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('password_confirmation');
    if (password && confirm && password.value !== confirm.value) {
      return { mismatch: true };
    }
    return null;
  }

  submit() {
    if (this.form.valid) {
      this.submitting = true;
      this.submitForm.emit(this.form.getRawValue());
    }
  }
}