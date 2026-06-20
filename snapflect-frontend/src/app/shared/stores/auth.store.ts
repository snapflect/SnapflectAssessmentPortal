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