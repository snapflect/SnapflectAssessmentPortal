import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AuthStore } from '../../shared/stores/auth.store';
import { UserStore } from '../../shared/stores/user.store';
import { Router } from '@angular/router';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authStore = inject(AuthStore);
  const userStore = inject(UserStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error caught in interceptor:', error);
      
      let errorMsg = 'An unexpected error occurred.';
      if (error.error && error.error.detail) {
        errorMsg = typeof error.error.detail === 'string' ? error.error.detail : 'Validation Failed';
      } else if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      if (error.status === 401) {
        // Log the user out locally because their token was rejected/invalidated
        authStore.clearToken();
        userStore.setProfile(null as any);
        toastService.warning('Session Expired', 'Please log in again.');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        toastService.warning('Access Denied', 'You do not have permission to perform this action.');
      } else if (error.status >= 500) {
        toastService.error('Server Error', 'The server encountered an error. Please try again later.');
      } else {
        const isEndOfQuestions = error.status === 404 && error.error?.detail === 'No more questions';
        if (!error.error?.validation_errors && !isEndOfQuestions && error.status !== 422) {
          toastService.error('Error', errorMsg);
        }
      }

      return throwError(() => error);
    })
  );
};