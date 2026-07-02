import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../../shared/stores/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const authenticated = authStore.isAuthenticated();
  console.log('[authGuard] isAuthenticated:', authenticated, '| token:', authStore.token(), '| url:', state.url);

  if (authenticated) {
    return true;
  }

  return router.parseUrl('/auth/login');
};