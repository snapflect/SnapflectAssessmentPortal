import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ManualReviewStore {
  private readonly _reviews = signal<any[]>([]);
  public readonly reviews = this._reviews.asReadonly();
  public setReviews(data: any[]): void { this._reviews.set(data); }
}