import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../environments/environment';
import { LoginRequestModel, LoginResponseModel, ChangePasswordModel } from '../../shared/models/auth.models';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthApiService]
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call login and return data', () => {
    const mockCredentials: LoginRequestModel = { email: 'test@example.com', password: 'password' };
    const mockResponse: LoginResponseModel = { token: 'mock-token', user: { id: '1', name: 'Test' } } as any;

    service.login(mockCredentials).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should call logout', () => {
    service.logout().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });

  it('should call me and return user data', () => {
    const mockResponse: LoginResponseModel = { token: 'mock-token', user: { id: '1', name: 'Test' } } as any;

    service.me().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should call changePassword', () => {
    const mockData: ChangePasswordModel = { current_password: 'old', new_password: 'new', new_password_confirmation: 'new' };

    service.changePassword(mockData).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/auth/change-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(null);
  });
});
