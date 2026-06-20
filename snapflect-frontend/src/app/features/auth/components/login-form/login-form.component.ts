import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoginRequestModel } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule],
  template: "<form [formGroup]='form' (ngSubmit)='submit()'><mat-card><mat-card-header><mat-card-title>Login</mat-card-title></mat-card-header><mat-card-content><mat-form-field appearance='outline' class='w-100'><mat-label>Email</mat-label><input matInput formControlName='email' type='email' /></mat-form-field><mat-form-field appearance='outline' class='w-100'><mat-label>Password</mat-label><input matInput formControlName='password' type='password' /></mat-form-field></mat-card-content><mat-card-actions><button mat-raised-button color='primary' type='submit' [disabled]='form.invalid'>Sign In</button></mat-card-actions></mat-card></form>",
  styles: [".w-100 { width: 100%; display: block; margin-bottom: 16px; }"]
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  submitLogin = output<LoginRequestModel>();

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