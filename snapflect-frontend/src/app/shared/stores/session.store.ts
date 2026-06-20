import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _sessions = signal<any[]>([]);
  public readonly sessions = this._sessions.asReadonly();
  public setSessions(data: any[]): void { this._sessions.set(data); }
}