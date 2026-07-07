import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../../shared/stores/auth.store';

describe('AuthGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authStore: jasmine.SpyObj<AuthStore>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);
    authStore = jasmine.createSpyObj('AuthStore', ['isAuthenticated', 'token']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthStore, useValue: authStore }
      ]
    });
  });

  it('should allow access if user is authenticated', () => {
    authStore.isAuthenticated.and.returnValue(true);
    authStore.token.and.returnValue('some-token');

    const mockRoute = new ActivatedRouteSnapshot();
    const mockState = { url: '/dashboard' } as RouterStateSnapshot;

    let result;
    TestBed.runInInjectionContext(() => {
      result = authGuard(mockRoute, mockState);
    });

    expect(result).toBeTrue();
  });

  it('should redirect to login if user is not authenticated', () => {
    authStore.isAuthenticated.and.returnValue(false);
    authStore.token.and.returnValue(null);

    const mockRoute = new ActivatedRouteSnapshot();
    const mockState = { url: '/protected-route' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      authGuard(mockRoute, mockState);
    });

    expect(router.parseUrl).toHaveBeenCalledWith('/auth/login');
  });
});