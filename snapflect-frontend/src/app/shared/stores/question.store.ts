import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class QuestionStore {
  private readonly _questions = signal<any[]>([]);
  public readonly questions = this._questions.asReadonly();
  public setQuestions(data: any[]): void { this._questions.set(data); }
}