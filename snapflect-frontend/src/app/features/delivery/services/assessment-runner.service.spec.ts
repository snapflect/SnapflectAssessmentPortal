import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssessmentRunnerService } from './assessment-runner.service';
import { environment } from '../../../../environments/environment';

describe('AssessmentRunnerService', () => {
  let service: AssessmentRunnerService;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(() => {
    router = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AssessmentRunnerService,
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AssessmentRunnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should launch session and set attempt state', () => {
    const mockResponse = {
      data: {
        uuid: 'test-attempt-123',
        attributes: { status: 'IN_PROGRESS', time_limit_minutes: 60 }
      }
    };

    service.launchSession('test-session-456').subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/delivery/sessions/test-session-456/launch`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.attempt()?.uuid).toBe('test-attempt-123');
    expect(service.attempt()?.status).toBe('IN_PROGRESS');
  });

  it('should start timer if expires_at is present and auto-submit when time expires', fakeAsync(() => {
    // Set expiry to 2 seconds from now
    const expiresAt = new Date(Date.now() + 2000).toISOString();
    const mockResponse = {
      data: {
        uuid: 'test-attempt-timer',
        attributes: { status: 'IN_PROGRESS', expires_at: expiresAt }
      }
    };

    service.loadAttempt('test-attempt-timer').subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/delivery/attempts/test-attempt-timer`);
    req.flush(mockResponse);

    // Initial tick to get timer running
    tick(1000);
    expect(service.timeRemainingSeconds()).toBeGreaterThan(0);

    // Tick past expiration
    tick(2000);
    
    // It should have triggered auto-submit
    const submitReq = httpMock.expectOne(`${environment.apiUrl}/delivery/attempts/test-attempt-timer/submit`);
    expect(submitReq.request.method).toBe('POST');
    submitReq.flush({});
    
    expect(service.timeRemainingSeconds()).toBe(0);
  }));

  it('should load questions and map to local QuestionState', () => {
    const mockQuestions = {
      data: [
        { uuid: 'q1', attributes: { is_flagged: false, candidate_answer: null } },
        { uuid: 'q2', attributes: { is_flagged: true, candidate_answer: { selected_options: ['opt1'] } } }
      ]
    };

    service.loadQuestions('test-attempt').subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/delivery/attempts/test-attempt/questions`);
    req.flush(mockQuestions);

    const questionMap = service.questionMap();
    expect(questionMap.length).toBe(2);
    expect(questionMap[0].is_answered).toBeFalse();
    expect(questionMap[0].is_flagged).toBeFalse();
    
    expect(questionMap[1].is_answered).toBeTrue();
    expect(questionMap[1].is_flagged).toBeTrue();
  });
});
