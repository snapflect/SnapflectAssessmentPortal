import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { permissionGuard } from './permission.guard';
import { UserStore } from '../../shared/stores/user.store';

describe('PermissionGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let userStore: jasmine.SpyObj<UserStore>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['parseUrl']);
    userStore = jasmine.createSpyObj('UserStore', ['hasAnyPermission']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: UserStore, useValue: userStore }
      ]
    });
  });

  it('should allow access if user has required permissions', () => {
    userStore.hasAnyPermission.and.returnValue(true);

    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.data = { permissions: ['WRITE_DATA'] };
    const mockState = {} as RouterStateSnapshot;

    let result;
    TestBed.runInInjectionContext(() => {
      result = permissionGuard(mockRoute, mockState);
    });

    expect(userStore.hasAnyPermission).toHaveBeenCalledWith(['WRITE_DATA']);
    expect(result).toBeTrue();
  });

  it('should redirect to unauthorized if user lacks permissions', () => {
    userStore.hasAnyPermission.and.returnValue(false);

    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.data = { permissions: ['WRITE_DATA'] };
    const mockState = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      permissionGuard(mockRoute, mockState);
    });

    expect(router.parseUrl).toHaveBeenCalledWith('/unauthorized');
  });
});