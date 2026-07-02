import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { UserStore } from '../../shared/stores/user.store';
import { AuthStore } from '../../shared/stores/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const userStore = inject(UserStore);
  const authStore = inject(AuthStore);

  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated()) {
    console.warn('[roleGuard] Not authenticated, redirecting to /auth/login');
    return router.parseUrl('/auth/login');
  }

  // Check expected roles from route data
  const expectedRoles = route.data?.['roles'] as Array<string>;

  if (!expectedRoles || expectedRoles.length === 0) {
    return true; // No roles defined, allow access
  }

  if (userStore.hasAnyRole(expectedRoles)) {
    return true;
  }

  // Not authorized for this route, redirect to default dashboard
  console.warn('[roleGuard] Role mismatch. User roles:', userStore.profile()?.roles, 'Expected:', expectedRoles);
  return router.parseUrl('/dashboard');
};