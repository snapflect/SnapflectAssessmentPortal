import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
// import { NavigationStore } from '../../shared/stores/navigation.store';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // const navStore = inject(NavigationStore);
  // navStore.setLoading(true);
  return next(req).pipe(
    finalize(() => {
      // navStore.setLoading(false);
    })
  );
};