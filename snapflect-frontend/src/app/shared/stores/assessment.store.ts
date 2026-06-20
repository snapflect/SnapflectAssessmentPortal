import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AssessmentStore {
  private readonly _assessments = signal<any[]>([]);
  public readonly assessments = this._assessments.asReadonly();
  public setAssessments(data: any[]): void { this._assessments.set(data); }
}