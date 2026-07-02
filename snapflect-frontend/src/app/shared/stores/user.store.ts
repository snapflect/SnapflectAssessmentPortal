import { Injectable, signal, computed } from '@angular/core';

export interface UserProfile {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  organization_name?: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _profile = signal<UserProfile | null>(
    sessionStorage.getItem('user_profile') ? JSON.parse(sessionStorage.getItem('user_profile')!) : null
  );

  public readonly profile = this._profile.asReadonly();
  public readonly tenantId = computed(() => this._profile()?.tenantId || null);

  public setProfile(profile: UserProfile | null): void {
    if (profile) {
      sessionStorage.setItem('user_profile', JSON.stringify(profile));
    } else {
      sessionStorage.removeItem('user_profile');
    }
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