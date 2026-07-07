import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportingApiService } from './reporting-api.service';
import { environment } from '../../../environments/environment';

describe('ReportingApiService', () => {
  let service: ReportingApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportingApiService]
    });
    service = TestBed.inject(ReportingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get assessment report', () => {
    const mockParams = { start: 'today' };
    const mockResponse = { data: 'report' };
    service.getAssessmentReport(mockParams).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(req => req.url === `${baseUrl}/reports/assessments`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('start')).toBe('today');
    req.flush(mockResponse);
  });

  it('should get competency report', () => {
    const mockParams = { user: '1' };
    const mockResponse = { data: 'report' };
    service.getCompetencyReport(mockParams).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(req => req.url === `${baseUrl}/reports/competencies`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('user')).toBe('1');
    req.flush(mockResponse);
  });

  it('should get pass fail report', () => {
    const mockParams = { org: 'test' };
    const mockResponse = { data: 'report' };
    service.getPassFailReport(mockParams).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(req => req.url === `${baseUrl}/reports/pass-fail`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('org')).toBe('test');
    req.flush(mockResponse);
  });

  it('should get candidate report', () => {
    const mockParams = { filter: 'active' };
    const mockResponse = { data: 'report' };
    service.getCandidateReport(mockParams).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(req => req.url === `${baseUrl}/reports/candidates`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('filter')).toBe('active');
    req.flush(mockResponse);
  });

  it('should export csv', () => {
    const mockParams = { type: 'users' };
    const mockBlob = new Blob(['csv content'], { type: 'text/csv' });
    service.exportCsv(mockParams).subscribe(res => expect(res).toEqual(mockBlob));
    const req = httpMock.expectOne(req => req.url === `${baseUrl}/reports/export/csv`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('type')).toBe('users');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
