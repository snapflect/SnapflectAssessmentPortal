import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ResultVersionStore {
  private readonly _versions = signal<any[]>([]);
  public readonly versions = this._versions.asReadonly();
  public setVersions(data: any[]): void { this._versions.set(data); }
}