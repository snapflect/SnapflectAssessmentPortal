import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { throwError } from 'rxjs';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'warning', 'info', 'success']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle 401 Unauthorized', (done) => {
    TestBed.runInInjectionContext(() => {
      const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      const nextFn = jasmine.createSpy('next').and.returnValue(throwError(() => errorResponse));
      const req = { url: '/api/data' } as any;

      errorInterceptor(req, nextFn).subscribe({
        next: () => fail('Should have failed with 401'),
        error: (error) => {
          expect(error.status).toEqual(401);
          expect(toastServiceSpy.warning).toHaveBeenCalledWith('Session Expired', 'Please log in again.');
          done();
        }
      });
    });
  });

  it('should handle 500 Server Error', (done) => {
    TestBed.runInInjectionContext(() => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      const nextFn = jasmine.createSpy('next').and.returnValue(throwError(() => errorResponse));
      const req = { url: '/api/data' } as any;

      errorInterceptor(req, nextFn).subscribe({
        next: () => fail('Should have failed with 500'),
        error: (error) => {
          expect(error.status).toEqual(500);
          expect(toastServiceSpy.error).toHaveBeenCalledWith('Server Error', 'The server encountered an error. Please try again later.');
          done();
        }
      });
    });
  });

  it('should handle generic 400 error', (done) => {
    TestBed.runInInjectionContext(() => {
      const errorResponse = new HttpErrorResponse({ 
        status: 400, 
        error: { message: 'Bad Request Message' } 
      });
      const nextFn = jasmine.createSpy('next').and.returnValue(throwError(() => errorResponse));
      const req = { url: '/api/data' } as any;

      errorInterceptor(req, nextFn).subscribe({
        next: () => fail('Should have failed with 400'),
        error: (error) => {
          expect(error.status).toEqual(400);
          expect(toastServiceSpy.error).toHaveBeenCalledWith('Error', 'Bad Request Message');
          done();
        }
      });
    });
  });

  it('should not show toast for validation errors', (done) => {
    TestBed.runInInjectionContext(() => {
      const errorResponse = new HttpErrorResponse({ 
        status: 422, 
        error: { validation_errors: { email: ['Invalid email'] } } 
      });
      const nextFn = jasmine.createSpy('next').and.returnValue(throwError(() => errorResponse));
      const req = { url: '/api/data' } as any;

      errorInterceptor(req, nextFn).subscribe({
        next: () => fail('Should have failed with 422'),
        error: (error) => {
          expect(error.status).toEqual(422);
          expect(toastServiceSpy.error).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});