import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly _kpis = signal<any | null>(null);
  public readonly kpis = this._kpis.asReadonly();
  public setKpis(data: any): void { this._kpis.set(data); }
}