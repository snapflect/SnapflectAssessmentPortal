import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class QuestionBankStore {
  private readonly _questionBanks = signal<any[]>([]);
  public readonly questionBanks = this._questionBanks.asReadonly();
  public setQuestionBanks(data: any[]): void { this._questionBanks.set(data); }
}