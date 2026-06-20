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