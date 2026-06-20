import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CompetencyStore {
  private readonly _competencies = signal<any[]>([]);
  public readonly competencies = this._competencies.asReadonly();
  public setCompetencies(data: any[]): void { this._competencies.set(data); }
}