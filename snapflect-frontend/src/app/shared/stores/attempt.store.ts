import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AttemptStore {
  private readonly _currentAttempt = signal<any | null>(null);
  private readonly _answers = signal<Record<string, any>>({});
  public readonly currentAttempt = this._currentAttempt.asReadonly();
  public readonly answers = this._answers.asReadonly();
  public setCurrentAttempt(data: any): void { this._currentAttempt.set(data); }
  public setAnswer(questionUuid: string, answer: any): void {
    this._answers.update(a => ({ ...a, [questionUuid]: answer }));
  }
}