import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthStore } from '../../shared/stores/auth.store';
import { UserStore } from '../../shared/stores/user.store';

describe('GuestGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authStore: jasmine.SpyObj<AuthStore>;
  let userStore: jasmine.SpyObj<UserStore>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['parseUrl']);
    authStore = jasmine.createSpyObj('AuthStore', ['isAuthenticated']);
    userStore = jasmine.createSpyObj('UserStore', ['getDefaultRoute']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthStore, useValue: authStore },
        { provide: UserStore, useValue: userStore }
      ]
    });
  });

  it('should allow access if user is not authenticated', () => {
    authStore.isAuthenticated.and.returnValue(false);

    const mockRoute = new ActivatedRouteSnapshot();
    const mockState = { url: '/auth/login' } as RouterStateSnapshot;

    let result;
    TestBed.runInInjectionContext(() => {
      result = guestGuard(mockRoute, mockState);
    });

    expect(result).toBeTrue();
  });

  it('should redirect to default route if user is already authenticated', () => {
    authStore.isAuthenticated.and.returnValue(true);
    userStore.getDefaultRoute.and.returnValue('/dashboard');

    const mockRoute = new ActivatedRouteSnapshot();
    const mockState = { url: '/auth/login' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      guestGuard(mockRoute, mockState);
    });

    expect(router.parseUrl).toHaveBeenCalledWith('/dashboard');
  });
});