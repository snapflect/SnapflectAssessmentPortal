import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthFacade } from '../../facades/auth.facade';
import { LoginRequestModel } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-darker text-slate-200 p-4">
      <div class="w-full max-w-md">
        <!-- Logo Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light mb-2">
            Snapflect
          </h1>
          <p class="text-slate-400">Sign in to your assessment portal</p>
        </div>
        
        <app-login-form (submitLogin)='onLogin($event)'></app-login-form>
        
        <div class="mt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 Snapflect Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  private authFacade = inject(AuthFacade);

  onLogin(credentials: LoginRequestModel) {
    this.authFacade.login(credentials).subscribe({
      error: (err) => console.error('Login failed', err)
    });
  }
}