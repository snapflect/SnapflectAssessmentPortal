import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { LoginRequestModel, LoginResponseModel, ChangePasswordModel, ClaimAccountRequestModel } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService extends BaseApiService {
  
  public login(credentials: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(`${this.baseUrl}/auth/login`, credentials);
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }

  public me(): Observable<LoginResponseModel> {
    return this.http.get<LoginResponseModel>(`${this.baseUrl}/auth/me`);
  }

  public changePassword(data: ChangePasswordModel): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/change-password`, data);
  }

  public claimAccount(data: ClaimAccountRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(`${this.baseUrl}/auth/claim-account`, data);
  }

  public forgotPassword(email: string): Observable<{success: boolean; message: string}> {
    return this.http.post<{success: boolean; message: string}>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  public resetPassword(data: import('../../shared/models/auth.models').ResetPasswordRequestModel): Observable<{success: boolean; message: string}> {
    return this.http.post<{success: boolean; message: string}>(`${this.baseUrl}/auth/reset-password`, data);
  }
}