import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ResultsStore {
  private readonly _results = signal<any[]>([]);
  private readonly _currentResult = signal<any | null>(null);
  public readonly results = this._results.asReadonly();
  public readonly currentResult = this._currentResult.asReadonly();
  public setResults(data: any[]): void { this._results.set(data); }
  public setCurrentResult(data: any): void { this._currentResult.set(data); }
}