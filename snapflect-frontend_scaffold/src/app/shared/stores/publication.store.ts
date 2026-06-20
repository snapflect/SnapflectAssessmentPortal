import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class PublicationStore {
  private readonly _publication = signal<any | null>(null);
  public readonly publication = this._publication.asReadonly();
  public setPublication(data: any): void { this._publication.set(data); }
}