import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const permissionGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const expectedPermissions: string[] = route.data['permissions'] || [];

  if (userStore.hasAnyPermission(expectedPermissions)) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};