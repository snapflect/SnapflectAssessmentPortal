import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationStore {
  private readonly _isLoading = signal<boolean>(false);
  private readonly _loadingMessage = signal<string>('Loading...');
  private readonly _currentPath = signal<string>('');

  public readonly isLoading = this._isLoading.asReadonly();
  public readonly loadingMessage = this._loadingMessage.asReadonly();
  public readonly currentPath = this._currentPath.asReadonly();

  public setLoading(state: boolean, message: string = 'Loading...'): void {
    this._isLoading.set(state);
    this._loadingMessage.set(message);
  }

  public setPath(path: string): void {
    this._currentPath.set(path);
  }
}