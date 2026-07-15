import { Injectable, inject } from '@angular/core';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UserStore } from '../../../shared/stores/user.store';
import { UserMapper } from '../../../shared/mappers/user.mapper';
import { LoginRequestModel, ChangePasswordModel, ClaimAccountRequestModel } from '../../../shared/models/auth.models';
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
        console.log('[AuthFacade] Login response received:', res.user?.roles);
        this.authStore.setToken(res.access_token);
        this.userStore.setProfile(UserMapper.toUserProfile(res.user));
        const route = this.userStore.getDefaultRoute();
        console.log('[AuthFacade] Token set, isAuthenticated:', this.authStore.isAuthenticated(), '| navigating to:', route);
        this.router.navigate([route]);
      })
    );
  }

  public logout(): Observable<any> {
    return this.api.logout().pipe(
      tap(() => {
        this.authStore.clearToken();
        this.userStore.setProfile(null as any);
        window.location.href = '/auth/login';
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

  public claimAccount(data: ClaimAccountRequestModel): Observable<any> {
    return this.api.claimAccount(data).pipe(
      tap(res => {
        this.authStore.setToken(res.access_token);
        this.userStore.setProfile(UserMapper.toUserProfile(res.user));
        const route = this.userStore.getDefaultRoute();
        this.router.navigate([route]);
      })
    );
  }

  public forgotPassword(email: string): Observable<{success: boolean; message: string}> {
    return this.api.forgotPassword(email);
  }

  public resetPassword(data: import('../../../shared/models/auth.models').ResetPasswordRequestModel): Observable<{success: boolean; message: string}> {
    return this.api.resetPassword(data);
  }
}