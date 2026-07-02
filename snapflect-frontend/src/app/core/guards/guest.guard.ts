import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../../shared/stores/auth.store';
import { UserStore } from '../../shared/stores/user.store';

export const guestGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    // Already logged in, go to appropriate dashboard
    return router.parseUrl(userStore.getDefaultRoute());
  }

  return true;
};