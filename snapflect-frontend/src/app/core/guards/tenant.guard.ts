import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserStore } from '../../shared/stores/user.store';

export const tenantGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const tenantId = route.params['tenantId'];

  if (userStore.tenantId() === tenantId) {
    return true;
  }

  return inject(Router).parseUrl('/unauthorized');
};