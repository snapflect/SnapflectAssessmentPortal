import { TestBed } from '@angular/core/testing';
import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { AuthStore } from '../../../shared/stores/auth.store';
import { UserStore } from '../../../shared/stores/user.store';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let apiSpy: jasmine.SpyObj<AuthApiService>;
  let authStoreSpy: jasmine.SpyObj<AuthStore>;
  let userStoreSpy: jasmine.SpyObj<UserStore>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('AuthApiService', ['login', 'logout', 'me', 'changePassword']);
    authStoreSpy = jasmine.createSpyObj('AuthStore', ['setToken', 'clearToken', 'isAuthenticated']);
    userStoreSpy = jasmine.createSpyObj('UserStore', ['setProfile', 'getDefaultRoute']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: apiSpy },
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    facade = TestBed.inject(AuthFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should login, update stores, and navigate to default route', (done) => {
    const mockCredentials = { email: 'test@test.com', password: 'password' };
    const mockResponse: any = {
      access_token: 'fake-jwt',
      user: {
        id: 1,
        uuid: 'test',
        first_name: 'test',
        last_name: 'test',
        email: 'test@test.com',
        roles: ['ADMIN'],
        permissions: []
      }
    };

    apiSpy.login.and.returnValue(of(mockResponse));
    userStoreSpy.getDefaultRoute.and.returnValue('/dashboard');
    authStoreSpy.isAuthenticated.and.returnValue(true);

    facade.login(mockCredentials).subscribe(() => {
      expect(apiSpy.login).toHaveBeenCalledWith(mockCredentials);
      expect(authStoreSpy.setToken).toHaveBeenCalledWith('fake-jwt');
      expect(userStoreSpy.setProfile).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });

  it('should restore session and update user store', (done) => {
    const mockResponse: any = {
      access_token: 'token',
      user: {
        id: 1,
        uuid: 'test',
        first_name: 'test',
        last_name: 'test',
        email: 'test@test.com',
        roles: ['ADMIN'],
        permissions: []
      }
    };

    apiSpy.me.and.returnValue(of(mockResponse));

    facade.restoreSession().subscribe(() => {
      expect(apiSpy.me).toHaveBeenCalled();
      expect(userStoreSpy.setProfile).toHaveBeenCalled();
      done();
    });
  });

  it('should call changePassword on api', (done) => {
    const mockData = { current_password: 'old', new_password: 'new', new_password_confirmation: 'new' };
    apiSpy.changePassword.and.returnValue(of(undefined));

    facade.changePassword(mockData).subscribe(() => {
      expect(apiSpy.changePassword).toHaveBeenCalledWith(mockData);
      done();
    });
  });
});