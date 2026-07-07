import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsApiService } from './analytics-api.service';
import { environment } from '../../../environments/environment';

describe('AnalyticsApiService', () => {
  let service: AnalyticsApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsApiService]
    });
    service = TestBed.inject(AnalyticsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get assessment trends', () => {
    const mockParams = { date: '2023-01-01' };
    const mockResponse = { data: 'trends' };

    service.getAssessmentTrends(mockParams).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url === `${baseUrl}/analytics/trends`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('date')).toBe('2023-01-01');
    req.flush(mockResponse);
  });

  it('should get completion metrics', () => {
    const mockParams = { group: 'A' };
    const mockResponse = { data: 'metrics' };

    service.getCompletionMetrics(mockParams).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url === `${baseUrl}/analytics/completion`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('group')).toBe('A');
    req.flush(mockResponse);
  });

  it('should get competency heatmaps', () => {
    const mockParams = { level: '1' };
    const mockResponse = { data: 'heatmaps' };

    service.getCompetencyHeatmaps(mockParams).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url === `${baseUrl}/analytics/heatmaps`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('level')).toBe('1');
    req.flush(mockResponse);
  });

  it('should get score distribution', () => {
    const mockParams = { type: 'test' };
    const mockResponse = { data: 'distribution' };

    service.getScoreDistribution(mockParams).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url === `${baseUrl}/analytics/distribution`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('type')).toBe('test');
    req.flush(mockResponse);
  });
});
