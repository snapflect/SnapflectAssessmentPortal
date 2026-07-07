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

  // Delivery Execution State
  private readonly _timeRemainingSeconds = signal<number | null>(null);
  private readonly _questionMap = signal<any[]>([]);
  private readonly _isSubmitting = signal<boolean>(false);

  public readonly timeRemainingSeconds = this._timeRemainingSeconds.asReadonly();
  public readonly questionMap = this._questionMap.asReadonly();
  public readonly isSubmitting = this._isSubmitting.asReadonly();

  public setTimeRemaining(seconds: number | null): void { this._timeRemainingSeconds.set(seconds); }
  public setQuestionMap(map: any[]): void { this._questionMap.set(map); }
  public setIsSubmitting(isSubmitting: boolean): void { this._isSubmitting.set(isSubmitting); }

  private readonly _elapsedSeconds = signal<number>(0);
  public readonly elapsedSeconds = this._elapsedSeconds.asReadonly();
  public setElapsedSeconds(seconds: number): void { this._elapsedSeconds.set(seconds); }

  private readonly _submissionResult = signal<any | null>(null);
  public readonly submissionResult = this._submissionResult.asReadonly();
  public setSubmissionResult(result: any): void { this._submissionResult.set(result); }
  
  public updateQuestionState(uuid: string, updates: any): void {
    this._questionMap.update(state => 
      state.map(q => q.uuid === uuid ? { ...q, ...updates } : q)
    );
  }
}