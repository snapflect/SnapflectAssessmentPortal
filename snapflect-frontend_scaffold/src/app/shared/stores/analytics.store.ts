import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly _metrics = signal<any | null>(null);
  public readonly metrics = this._metrics.asReadonly();
  public setMetrics(data: any): void { this._metrics.set(data); }
}