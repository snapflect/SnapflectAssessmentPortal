import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error caught in interceptor:', error);
      
      let errorMsg = 'An unexpected error occurred.';
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      if (error.status === 401 || error.status === 403) {
        toastService.warning('Access Denied', 'You do not have permission to perform this action.');
      } else if (error.status >= 500) {
        toastService.error('Server Error', 'The server encountered an error. Please try again later.');
      } else {
        if (!error.error?.validation_errors) {
          toastService.error('Error', errorMsg);
        }
      }

      return throwError(() => error);
    })
  );
};