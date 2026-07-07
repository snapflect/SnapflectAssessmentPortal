import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../../shared/stores/auth.store';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authStoreSpy: jasmine.SpyObj<AuthStore>;

  beforeEach(() => {
    authStoreSpy = jasmine.createSpyObj('AuthStore', ['token']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthStore, useValue: authStoreSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists', () => {
    authStoreSpy.token.and.returnValue('my-jwt-token');

    // Run test in injection context because it's a function interceptor
    TestBed.runInInjectionContext(() => {
      const nextFn = jasmine.createSpy('next').and.returnValue('handled');
      const req = { clone: jasmine.createSpy('clone').and.returnValue('clonedReq') } as any;

      const result = authInterceptor(req, nextFn);

      expect(req.clone).toHaveBeenCalledWith({
        setHeaders: {
          Authorization: 'Bearer my-jwt-token'
        }
      });
      expect(nextFn).toHaveBeenCalledWith('clonedReq');
      expect(result).toEqual('handled' as any);
    });
  });

  it('should not modify request if token does not exist', () => {
    authStoreSpy.token.and.returnValue(null);

    TestBed.runInInjectionContext(() => {
      const nextFn = jasmine.createSpy('next').and.returnValue('handled');
      const req = { clone: jasmine.createSpy('clone') } as any;

      const result = authInterceptor(req, nextFn);

      expect(req.clone).not.toHaveBeenCalled();
      expect(nextFn).toHaveBeenCalledWith(req);
      expect(result).toEqual('handled' as any);
    });
  });
});