import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssessmentApiService } from './assessment-api.service';
import { environment } from '../../../environments/environment';

describe('AssessmentApiService', () => {
  let service: AssessmentApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssessmentApiService]
    });
    service = TestBed.inject(AssessmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get assessments', () => {
    const mockResponse = { data: 'assessments' };
    service.getAssessments().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/assessments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get question banks', () => {
    const mockResponse = { data: 'banks' };
    service.getQuestionBanks().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/question-banks`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get questions', () => {
    const mockResponse = { data: 'questions' };
    service.getQuestions().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/questions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get competencies', () => {
    const mockResponse = { data: 'competencies' };
    service.getCompetencies().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/competencies`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get blueprints', () => {
    const mockResponse = { data: 'blueprints' };
    service.getBlueprints().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/blueprints`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get publications', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'publications' };
    service.getPublications(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/assessments/${mockUuid}/publications`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
