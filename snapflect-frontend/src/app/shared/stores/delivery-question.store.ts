import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class DeliveryQuestionStore {
  private readonly _questions = signal<any[]>([]);
  private readonly _currentIndex = signal<number>(0);
  public readonly questions = this._questions.asReadonly();
  public readonly currentIndex = this._currentIndex.asReadonly();
  public setQuestions(data: any[]): void { this._questions.set(data); }
  public setCurrentIndex(idx: number): void { this._currentIndex.set(idx); }
}