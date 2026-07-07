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

  public getDefaultRoute(): string {
    const profile = this._profile();
    if (!profile) {
      return '/auth/login';
    }
    const isOnlyContentCreator = profile.roles?.length === 1 && profile.roles[0] === 'CONTENT_CREATOR';
    if (isOnlyContentCreator) {
      return '/authoring/dashboard';
    }
    const isOnlyCandidate = profile.roles?.length === 1 && profile.roles[0] === 'CANDIDATE';
    if (isOnlyCandidate) {
      return '/delivery/dashboard';
    }

    const isOnlyProctor = profile.roles?.length === 1 && profile.roles[0] === 'PROCTOR';
    if (isOnlyProctor) {
      return '/delivery/proctoring';
    }
    const isOnlyReviewer = profile.roles?.length === 1 && profile.roles[0] === 'REVIEWER';
    if (isOnlyReviewer) {
      return '/results/reviewer-dashboard';
    }
    const isOnlyAssessmentManager = profile.roles?.length === 1 && profile.roles[0] === 'ASSESSMENT_MANAGER';
    if (isOnlyAssessmentManager) {
      return '/authoring/dashboard'; // AM's home domain is Authoring — same pattern as Content Creator → /authoring/dashboard
    }
    // All roles land on /dashboard — the dashboard page renders role-specific content
    return '/dashboard';
  }
}