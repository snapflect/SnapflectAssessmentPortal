import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ReportingStore {
  private readonly _reports = signal<any[]>([]);
  public readonly reports = this._reports.asReadonly();
  public setReports(data: any[]): void { this._reports.set(data); }
}