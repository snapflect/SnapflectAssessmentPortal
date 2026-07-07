import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tenantGuard } from './tenant.guard';
import { UserStore } from '../../shared/stores/user.store';

describe('TenantGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let userStore: jasmine.SpyObj<UserStore>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['parseUrl']);
    userStore = jasmine.createSpyObj('UserStore', ['tenantId']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: UserStore, useValue: userStore }
      ]
    });
  });

  it('should allow access if user tenantId matches route tenantId', () => {
    userStore.tenantId.and.returnValue('tenant-123');

    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.params = { tenantId: 'tenant-123' };
    const mockState = {} as RouterStateSnapshot;

    let result;
    TestBed.runInInjectionContext(() => {
      result = tenantGuard(mockRoute, mockState);
    });

    expect(result).toBeTrue();
  });

  it('should redirect to unauthorized if user tenantId does not match', () => {
    userStore.tenantId.and.returnValue('tenant-456');

    const mockRoute = new ActivatedRouteSnapshot();
    mockRoute.params = { tenantId: 'tenant-123' };
    const mockState = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      tenantGuard(mockRoute, mockState);
    });

    expect(router.parseUrl).toHaveBeenCalledWith('/unauthorized');
  });
});