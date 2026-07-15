import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsDashboardPageComponent } from './results-dashboard-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';

describe('ResultsDashboardPageComponent', () => {
  let component: ResultsDashboardPageComponent;
  let fixture: ComponentFixture<ResultsDashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsDashboardPageComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsDashboardPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and call fetchAll on init', () => {
    spyOn(component, 'fetchAll');
    fixture.detectChanges(); // calls ngOnInit
    expect(component).toBeTruthy();
    expect(component.fetchAll).toHaveBeenCalled();
  });

  describe('API Calls', () => {
    it('should handle fetchSummary success with .data wrapper', () => {
      component.fetchSummary();
      expect(component.loading).toBeTrue();

      const req = httpMock.expectOne(`${environment.apiUrl}/analytics/dashboard/summary`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { pass_rate: 80, total_passed: 8 } });

      expect(component.summary?.pass_rate).toBe(80);
      expect(component.loading).toBeFalse();
    });

    it('should handle fetchSummary success without .data wrapper', () => {
      component.fetchSummary();
      const req = httpMock.expectOne(`${environment.apiUrl}/analytics/dashboard/summary`);
      req.flush({ pass_rate: 70, total_passed: 7 });

      expect(component.summary?.pass_rate).toBe(70);
      expect(component.loading).toBeFalse();
    });

    it('should handle fetchSummary error', () => {
      component.fetchSummary();
      const req = httpMock.expectOne(`${environment.apiUrl}/analytics/dashboard/summary`);
      req.error(new ErrorEvent('Network error'));

      expect(component.loading).toBeFalse();
      expect(component.summary).toBeNull();
    });

    it('should handle fetchRecentResults success with .data wrapper', () => {
      component.fetchRecentResults();
      expect(component.resultsLoading).toBeTrue();

      const req = httpMock.expectOne(`${environment.apiUrl}/results/?include=candidate,assessment,assessmentAttempt&per_page=20&latest_attempt_per_candidate=true`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ uuid: '123' }] });

      expect(component.recentResults.length).toBe(1);
      expect(component.resultsLoading).toBeFalse();
    });

    it('should handle fetchRecentResults success without .data wrapper', () => {
      component.fetchRecentResults();
      const req = httpMock.expectOne(`${environment.apiUrl}/results/?include=candidate,assessment,assessmentAttempt&per_page=20&latest_attempt_per_candidate=true`);
      req.flush([{ uuid: '123' }]);

      expect(component.recentResults.length).toBe(1);
      expect(component.resultsLoading).toBeFalse();
    });

    it('should handle fetchRecentResults error', () => {
      component.fetchRecentResults();
      const req = httpMock.expectOne(`${environment.apiUrl}/results/?include=candidate,assessment,assessmentAttempt&per_page=20&latest_attempt_per_candidate=true`);
      req.error(new ErrorEvent('Network error'));

      expect(component.resultsLoading).toBeFalse();
    });
  });

  describe('Helper Methods', () => {
    it('should calculate getPassDash correctly', () => {
      const circ = 2 * Math.PI * 40;
      component.summary = { pass_rate: 50 } as any;
      const expectedDash = (50 / 100) * circ;
      expect(component.getPassDash()).toBe(`${expectedDash} ${circ - expectedDash}`);
      
      component.summary = null;
      expect(component.getPassDash()).toBe(`0 ${circ}`);
    });

    it('should calculate getFailDash correctly', () => {
      const circ = 2 * Math.PI * 40;
      component.summary = { pass_rate: 40 } as any; // fail rate 60%
      const expectedDash = (60 / 100) * circ;
      expect(component.getFailDash()).toBe(`${expectedDash} ${circ - expectedDash}`);
      
      component.summary = null; // fail rate 100%
      expect(component.getFailDash()).toBe(`${circ} 0`);
    });

    it('should calculate getFailOffset correctly', () => {
      const circ = 2 * Math.PI * 40;
      component.summary = { pass_rate: 40 } as any;
      const expectedOffset = -((40 / 100) * circ);
      expect(component.getFailOffset()).toBe(expectedOffset);
      
      component.summary = null;
      expect(component.getFailOffset()).toBe(-0);
    });

    it('should calculate getAttemptsPct correctly', () => {
      component.summary = { total_assessments: 10, total_attempts: 25 } as any;
      // Math.min(100, (25 / Math.max(10 * 5, 1)) * 100) -> 25 / 50 * 100 = 50
      expect(component.getAttemptsPct()).toBe(50);
      
      // when over 100%
      component.summary = { total_assessments: 10, total_attempts: 100 } as any;
      expect(component.getAttemptsPct()).toBe(100);

      component.summary = null;
      expect(component.getAttemptsPct()).toBe(0);
      
      component.summary = { total_assessments: 0 } as any;
      expect(component.getAttemptsPct()).toBe(0);
    });

    it('should calculate getPassedPct correctly', () => {
      component.summary = { total_attempts: 10, total_passed: 4 } as any;
      expect(component.getPassedPct()).toBe(40);
      
      component.summary = null;
      expect(component.getPassedPct()).toBe(0);
      
      component.summary = { total_attempts: 0 } as any;
      expect(component.getPassedPct()).toBe(0);
    });

    it('should calculate getFailedPct correctly', () => {
      component.summary = { total_attempts: 10, total_failed: 6 } as any;
      expect(component.getFailedPct()).toBe(60);
      
      component.summary = null;
      expect(component.getFailedPct()).toBe(0);
      
      component.summary = { total_attempts: 0 } as any;
      expect(component.getFailedPct()).toBe(0);
    });
  });
});
