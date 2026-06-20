import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class BlueprintStore {
  private readonly _blueprints = signal<any[]>([]);
  public readonly blueprints = this._blueprints.asReadonly();
  public setBlueprints(data: any[]): void { this._blueprints.set(data); }
}