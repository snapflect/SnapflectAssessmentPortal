const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/auth/pages/login-page',
    'features/auth/pages/forgot-password-page',
    'features/auth/pages/reset-password-page',
    'features/auth/pages/profile-page',
    'features/auth/pages/change-password-page',
    'features/auth/components/login-form',
    'features/auth/components/forgot-password-form',
    'features/auth/components/reset-password-form',
    'features/auth/components/profile-form',
    'features/auth/components/change-password-form',
    'features/auth/facades',
    'shared/models',
    'shared/mappers'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- MODELS ---
writeTsFile('shared/models/auth.models.ts', `
export interface LoginRequestModel {
  email: string;
  password: string;
}

export interface LoginResponseModel {
  access_token: string;
  user: AuthenticatedUserModel;
}

export interface AuthenticatedUserModel {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: number;
  roles: string[];
  permissions: string[];
}

export interface ChangePasswordModel {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
`);

// --- MAPPERS ---
writeTsFile('shared/mappers/user.mapper.ts', `
import { AuthenticatedUserModel } from '../models/auth.models';
import { UserProfile } from '../stores/user.store';

export class UserMapper {
  static toUserProfile(apiUser: AuthenticatedUserModel): UserProfile {
    return {
      id: apiUser.id,
      email: apiUser.email,
      roles: apiUser.roles,
      permissions: apiUser.permissions,
      tenantId: apiUser.organization_id.toString()
    };
  }
}
`);

// --- STORES (Extend) ---
writeTsFile('shared/stores/auth.store.ts', `
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(sessionStorage.getItem('auth_token'));

  public readonly token = this._token.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._token());

  public setToken(token: string): void {
    sessionStorage.setItem('auth_token', token);
    this._token.set(token);
  }

  public clearToken(): void {
    sessionStorage.removeItem('auth_token');
    this._token.set(null);
  }
}
`);

// --- API SERVICE (Extend) ---
writeTsFile('core/api/auth-api.service.ts', `
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { LoginRequestModel, LoginResponseModel, ChangePasswordModel } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService extends BaseApiService {
  
  public login(credentials: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(\`\${this.baseUrl}/auth/login\`, credentials);
  }

  public logout(): Observable<void> {
    return this.http.post<void>(\`\${this.baseUrl}/auth/logout\`, {});
  }

  public me(): Observable<LoginResponseModel> {
    return this.http.get<LoginResponseModel>(\`\${this.baseUrl}/auth/me\`);
  }

  public changePassword(data: ChangePasswordModel): Observable<void> {
    return this.http.post<void>(\`\${this.baseUrl}/auth/change-password\`, data);
  }
}
`);

// --- FACADE ---
writeTsFile('features/auth/facades/auth.facade.ts', `
import { Injectable, inject } from '@angular/core';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UserStore } from '../../../shared/stores/user.store';
import { UserMapper } from '../../../shared/mappers/user.mapper';
import { LoginRequestModel, ChangePasswordModel } from '../../../shared/models/auth.models';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api = inject(AuthApiService);
  private authStore = inject(AuthStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  public login(credentials: LoginRequestModel): Observable<any> {
    return this.api.login(credentials).pipe(
      tap(res => {
        this.authStore.setToken(res.access_token);
        this.userStore.setProfile(UserMapper.toUserProfile(res.user));
        this.router.navigate(['/dashboard']);
      })
    );
  }

  public logout(): Observable<any> {
    return this.api.logout().pipe(
      tap(() => {
        this.authStore.clearToken();
        this.userStore.setProfile(null as any);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  public restoreSession(): Observable<any> {
    return this.api.me().pipe(
      tap(res => {
        this.userStore.setProfile(UserMapper.toUserProfile(res.user));
      })
    );
  }

  public changePassword(data: ChangePasswordModel): Observable<void> {
    return this.api.changePassword(data);
  }
}
`);

// --- COMPONENTS ---
writeTsFile('features/auth/components/login-form/login-form.component.ts', `
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
`);

// Placeholder for other forms
['forgot-password-form', 'reset-password-form', 'profile-form', 'change-password-form'].forEach(f => {
  const className = f.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
  writeTsFile('features/auth/components/' + f + '/' + f + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n\n" +
"@Component({\n" +
"  selector: 'app-" + f + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Placeholder</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
  );
});

// --- PAGES ---
writeTsFile('features/auth/pages/login-page/login-page.component.ts', 
"import { Component, inject } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"import { LoginFormComponent } from '../../components/login-form/login-form.component';\n" +
"import { AuthFacade } from '../../facades/auth.facade';\n" +
"import { LoginRequestModel } from '../../../../shared/models/auth.models';\n\n" +
"@Component({\n" +
"  selector: 'app-login-page',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule, LoginFormComponent],\n" +
"  template: \"<app-login-form (submitLogin)='onLogin($event)'></app-login-form>\"\n" +
"})\n" +
"export class LoginPageComponent {\n" +
"  private authFacade = inject(AuthFacade);\n\n" +
"  onLogin(credentials: LoginRequestModel) {\n" +
"    this.authFacade.login(credentials).subscribe({\n" +
"      error: (err) => console.error('Login failed', err)\n" +
"    });\n" +
"  }\n" +
"}\n"
);

// Placeholder for other pages
['forgot-password-page', 'reset-password-page', 'profile-page', 'change-password-page'].forEach(f => {
  const className = f.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
  const formName = f.replace('-page', '-form');
  const formClassName = formName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
  writeTsFile('features/auth/pages/' + f + '/' + f + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"import { " + formClassName + " } from '../../components/" + formName + "/" + formName + ".component';\n\n" +
"@Component({\n" +
"  selector: 'app-" + f + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule, " + formClassName + "],\n" +
"  template: '<app-" + formName + "></app-" + formName + ">'\n" +
"})\n" +
"export class " + className + " {}\n"
  );
});

// --- ROUTING ---
writeTsFile('features/auth/auth.routes.ts', `
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
`);

console.log('Sprint 05 Phase 3 Frontend Auth generated successfully.');
