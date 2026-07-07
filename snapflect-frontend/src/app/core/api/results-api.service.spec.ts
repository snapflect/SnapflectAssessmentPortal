import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResultsApiService } from './results-api.service';
import { environment } from '../../../environments/environment';

describe('ResultsApiService', () => {
  let service: ResultsApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResultsApiService]
    });
    service = TestBed.inject(ResultsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get results', () => {
    const mockResponse = { data: 'results' };
    service.getResults().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/results`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get result by uuid', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'result' };
    service.getResult(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/results/${mockUuid}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get versions', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'versions' };
    service.getVersions(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/results/${mockUuid}/versions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get publication', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'publication' };
    service.getPublication(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/results/${mockUuid}/publication`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get manual reviews', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'reviews' };
    service.getManualReviews(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/results/${mockUuid}/manual-reviews`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
