import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _profile = signal<UserProfile | null>(null);

  public readonly profile = this._profile.asReadonly();
  public readonly tenantId = computed(() => this._profile()?.tenantId || null);

  public setProfile(profile: UserProfile): void {
    this._profile.set(profile);
  }

  public hasAnyRole(roles: string[]): boolean {
    const userRoles = this._profile()?.roles || [];
    return roles.some(role => userRoles.includes(role));
  }

  public hasAnyPermission(permissions: string[]): boolean {
    const userPerms = this._profile()?.permissions || [];
    return permissions.some(p => userPerms.includes(p));
  }
}