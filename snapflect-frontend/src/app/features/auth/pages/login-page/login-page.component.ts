import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthFacade } from '../../facades/auth.facade';
import { LoginRequestModel } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  template: "<app-login-form (submitLogin)='onLogin($event)'></app-login-form>"
})
export class LoginPageComponent {
  private authFacade = inject(AuthFacade);

  onLogin(credentials: LoginRequestModel) {
    this.authFacade.login(credentials).subscribe({
      error: (err) => console.error('Login failed', err)
    });
  }
}