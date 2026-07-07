import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GovernanceApiService } from './governance-api.service';
import { environment } from '../../../environments/environment';

describe('GovernanceApiService', () => {
  let service: GovernanceApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GovernanceApiService]
    });
    service = TestBed.inject(GovernanceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get organizations', () => {
    const mockResponse = { data: 'organizations' };
    service.getOrganizations().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/organizations`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get departments', () => {
    const mockResponse = { data: 'departments' };
    service.getDepartments().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/departments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get roles', () => {
    const mockResponse = { data: 'roles' };
    service.getRoles().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get permissions', () => {
    const mockResponse = { data: 'permissions' };
    service.getPermissions().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/permissions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get users', () => {
    const mockResponse = { data: 'users' };
    service.getUsers().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
