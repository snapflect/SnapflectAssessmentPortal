import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthStore } from '../../shared/stores/auth.store';
import { UserStore } from '../../shared/stores/user.store';

describe('RoleGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authStore: jasmine.SpyObj<AuthStore>;
  let userStore: jasmine.SpyObj<UserStore>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    authStore = jasmine.createSpyObj('AuthStore', ['isAuthenticated']);
    userStore = jasmine.createSpyObj('UserStore', ['profile', 'hasAnyRole']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthStore, useValue: authStore },
        { provide: UserStore, useValue: userStore }
      ]
    });
  });

  it('should redirect to login if not authenticated', () => {
    authStore.isAuthenticated.and.returnValue(false);
    
    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.data = { roles: ['ADMIN'] };
    const mockState = {} as RouterStateSnapshot;
    
    TestBed.runInInjectionContext(() => {
      roleGuard(mockRoute, mockState);
    });

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should allow access if user has required role', () => {
    authStore.isAuthenticated.and.returnValue(true);
    userStore.hasAnyRole.and.returnValue(true);
    
    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.data = { roles: ['ADMIN', 'SUPER_ADMIN'] };
    const mockState = {} as RouterStateSnapshot;
    
    let result;
    TestBed.runInInjectionContext(() => {
      result = roleGuard(mockRoute, mockState);
    });

    expect(result).toBeTrue();
  });

  it('should redirect to dashboard if user lacks required role', () => {
    authStore.isAuthenticated.and.returnValue(true);
    userStore.hasAnyRole.and.returnValue(false);
    
    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.data = { roles: ['ADMIN'] };
    const mockState = {} as RouterStateSnapshot;
    
    TestBed.runInInjectionContext(() => {
      roleGuard(mockRoute, mockState);
    });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});