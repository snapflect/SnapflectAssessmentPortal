import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class OrganizationStore {
  private readonly _organizations = signal<any[]>([]);
  private readonly _currentOrg = signal<any | null>(null);
  public readonly organizations = this._organizations.asReadonly();
  public readonly currentOrg = this._currentOrg.asReadonly();
  public setOrganizations(data: any[]): void { this._organizations.set(data); }
  public setCurrentOrg(data: any): void { this._currentOrg.set(data); }
}