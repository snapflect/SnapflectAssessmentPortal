import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const roleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const expectedRoles: string[] = route.data['roles'] || [];

  if (userStore.hasAnyRole(expectedRoles)) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};