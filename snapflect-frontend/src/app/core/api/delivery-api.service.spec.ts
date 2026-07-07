import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryApiService } from './delivery-api.service';
import { environment } from '../../../environments/environment';

describe('DeliveryApiService', () => {
  let service: DeliveryApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryApiService]
    });
    service = TestBed.inject(DeliveryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get sessions', () => {
    const mockResponse = { data: 'sessions' };
    service.getSessions().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/delivery/sessions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should start attempt', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'attempt' };
    service.startAttempt(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/delivery/sessions/${mockUuid}/attempts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('should get attempt', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'attempt' };
    service.getAttempt(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/delivery/attempts/${mockUuid}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should save answer', () => {
    const mockUuid = '123';
    const payload = { answer: 'test' };
    const mockResponse = { success: true };
    service.saveAnswer(mockUuid, payload).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/delivery/attempts/${mockUuid}/answers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should submit attempt', () => {
    const mockUuid = '123';
    const mockResponse = { success: true };
    service.submitAttempt(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/delivery/attempts/${mockUuid}/submit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });
});
