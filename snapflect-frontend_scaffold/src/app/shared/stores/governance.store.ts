import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class GovernanceStore {
  private readonly _departments = signal<any[]>([]);
  private readonly _roles = signal<any[]>([]);
  private readonly _permissions = signal<any[]>([]);
  private readonly _users = signal<any[]>([]);
  public readonly departments = this._departments.asReadonly();
  public readonly roles = this._roles.asReadonly();
  public readonly permissions = this._permissions.asReadonly();
  public readonly users = this._users.asReadonly();
  public setDepartments(data: any[]): void { this._departments.set(data); }
  public setRoles(data: any[]): void { this._roles.set(data); }
  public setPermissions(data: any[]): void { this._permissions.set(data); }
  public setUsers(data: any[]): void { this._users.set(data); }
}