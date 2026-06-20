import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ForgotPasswordPageComponent } from './pages/forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { ChangePasswordPageComponent } from './pages/change-password-page/change-password-page.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'change-password', component: ChangePasswordPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];