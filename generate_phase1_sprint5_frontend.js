const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src');

const dirs = [
    'app/core/interceptors',
    'app/core/guards',
    'app/core/api',
    'app/shared/stores',
    'app/shared/components/app-loader',
    'app/shared/components/app-page-header',
    'app/shared/components/app-empty-state',
    'app/shared/models',
    'app/shared/enums',
    'app/shared/mappers',
    'app/layout',
    'app/features',
    'environments'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- INTERCEPTORS ---
writeTsFile('app/core/interceptors/auth.interceptor.ts', `
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../shared/stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: \`Bearer \${token}\`
      }
    });
  }

  return next(req);
};
`);

writeTsFile('app/core/interceptors/error.interceptor.ts', `
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error caught in interceptor:', error);
      // Centralized error handling logic goes here
      return throwError(() => error);
    })
  );
};
`);

writeTsFile('app/core/interceptors/loading.interceptor.ts', `
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
// import { NavigationStore } from '../../shared/stores/navigation.store';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // const navStore = inject(NavigationStore);
  // navStore.setLoading(true);
  return next(req).pipe(
    finalize(() => {
      // navStore.setLoading(false);
    })
  );
};
`);

// --- GUARDS ---
writeTsFile('app/core/guards/auth.guard.ts', `
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../../shared/stores/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
`);

writeTsFile('app/core/guards/guest.guard.ts', `
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../../shared/stores/auth.store';

export const guestGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/dashboard');
};
`);

writeTsFile('app/core/guards/role.guard.ts', `
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const roleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const expectedRoles: string[] = route.data['roles'] || [];

  if (userStore.hasAnyRole(expectedRoles)) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};
`);

writeTsFile('app/core/guards/permission.guard.ts', `
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const permissionGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const expectedPermissions: string[] = route.data['permissions'] || [];

  if (userStore.hasAnyPermission(expectedPermissions)) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};
`);

writeTsFile('app/core/guards/tenant.guard.ts', `
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const tenantGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const tenantId = route.params['tenantId'];

  if (userStore.tenantId() === tenantId) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};
`);

// --- STORES ---
writeTsFile('app/shared/stores/auth.store.ts', `
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(null);

  public readonly token = this._token.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._token());

  public setToken(token: string): void {
    this._token.set(token);
  }

  public clearToken(): void {
    this._token.set(null);
  }
}
`);

writeTsFile('app/shared/stores/user.store.ts', `
import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _profile = signal<UserProfile | null>(null);

  public readonly profile = this._profile.asReadonly();
  public readonly tenantId = computed(() => this._profile()?.tenantId || null);

  public setProfile(profile: UserProfile): void {
    this._profile.set(profile);
  }

  public hasAnyRole(roles: string[]): boolean {
    const userRoles = this._profile()?.roles || [];
    return roles.some(role => userRoles.includes(role));
  }

  public hasAnyPermission(permissions: string[]): boolean {
    const userPerms = this._profile()?.permissions || [];
    return permissions.some(p => userPerms.includes(p));
  }
}
`);

writeTsFile('app/shared/stores/navigation.store.ts', `
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationStore {
  private readonly _isLoading = signal<boolean>(false);
  private readonly _currentPath = signal<string>('');

  public readonly isLoading = this._isLoading.asReadonly();
  public readonly currentPath = this._currentPath.asReadonly();

  public setLoading(state: boolean): void {
    this._isLoading.set(state);
  }

  public setPath(path: string): void {
    this._currentPath.set(path);
  }
}
`);

// --- API SERVICES ---
writeTsFile('app/core/api/base-api.service.ts', `
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;
}
`);

writeTsFile('app/core/api/auth-api.service.ts', `
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService extends BaseApiService {
  
  public login(credentials: any): Observable<any> {
    return this.http.post(\`\${this.baseUrl}/auth/login\`, credentials);
  }

  public logout(): Observable<any> {
    return this.http.post(\`\${this.baseUrl}/auth/logout\`, {});
  }
}
`);

// --- SHARED COMPONENTS ---
writeTsFile('app/shared/components/app-loader/app-loader.component.ts', `
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: \`<div class="loader">Loading...</div>\`,
  styles: [\`.loader { /* Loader styles */ }\`]
})
export class AppLoaderComponent {}
`);

writeTsFile('app/shared/components/app-page-header/app-page-header.component.ts', `
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <header class="page-header">
      <h1>{{ title() }}</h1>
    </header>
  \`,
  styles: [\`.page-header { /* Header styles */ }\`]
})
export class AppPageHeaderComponent {
  title = input.required<string>();
}
`);

writeTsFile('app/shared/components/app-empty-state/app-empty-state.component.ts', `
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="empty-state">
      <p>{{ message() }}</p>
    </div>
  \`,
  styles: [\`.empty-state { /* Empty state styles */ }\`]
})
export class AppEmptyStateComponent {
  message = input<string>('No data available.');
}
`);

// --- ENVIRONMENTS ---
writeTsFile('environments/environment.ts', `
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
`);

writeTsFile('environments/environment.prod.ts', `
export const environment = {
  production: true,
  apiUrl: 'https://api.snapflect.com/v1',
};
`);

// --- ROUTING ---
writeTsFile('app/app.routes.ts', `
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Auth lazy module
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Dashboard lazy module
  },
  {
    path: 'assessments',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Assessments lazy module
  },
  {
    path: 'results',
    canActivate: [authGuard],
    loadChildren: () => Promise.resolve([]) // Placeholder for Results lazy module
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
`);

console.log('Sprint 05 Phase 1 Frontend Foundation generated successfully.');
