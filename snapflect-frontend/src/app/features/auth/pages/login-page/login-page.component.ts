import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthFacade } from '../../facades/auth.facade';
import { LoginRequestModel } from '../../../../shared/models/auth.models';
import { NavigationStore } from '../../../../shared/stores/navigation.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-page text-main p-4">
      <div class="w-full max-w-md">
        <!-- Logo Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-accent-light mb-2">
            Snapflect
          </h1>
          <p class="text-muted">Sign in to your assessment portal</p>
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
  private navStore = inject(NavigationStore);

  onLogin(credentials: LoginRequestModel) {
    this.navStore.setLoading(true, 'Authenticating...');
    this.authFacade.login(credentials).subscribe({
      next: () => {
        // SPA navigation happens in facade, we must manually turn off loader
        this.navStore.setLoading(false);
      },
      error: (err) => {
        this.navStore.setLoading(false);
        console.error('Login failed', err);
      }
    });
  }
}