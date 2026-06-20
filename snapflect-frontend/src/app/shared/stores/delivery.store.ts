import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class DeliveryStore {
  private readonly _state = signal<any | null>(null);
  public readonly state = this._state.asReadonly();
  public setState(data: any): void { this._state.set(data); }
}