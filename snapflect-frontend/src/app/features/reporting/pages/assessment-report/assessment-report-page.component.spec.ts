import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssessmentReportPageComponent } from './assessment-report-page.component';
import { environment } from '../../../../../environments/environment';

describe('AssessmentReportPageComponent', () => {
  let component: AssessmentReportPageComponent;
  let fixture: ComponentFixture<AssessmentReportPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AssessmentReportPageComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AssessmentReportPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/assessments/all`);
    req.flush({ success: true, data: [] });
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/assessments/all`);
    expect(req.request.method).toBe('GET');
    
    const mockData = [
      {
        assessment_name: 'Test 1',
        total_attempts: 10,
        completed: 10,
        pass_rate: 80,
        average_score: 85
      }
    ];
    
    req.flush({ success: true, data: mockData });
    
    expect(component.data).toEqual(mockData);
    expect(component.loading).toBeFalse();
  });

  it('should handle error on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/assessments/all`);
    
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  describe('getPassRateClass', () => {
    it('should return text-emerald-500 for rate >= 80', () => {
      expect(component.getPassRateClass(85)).toBe('text-emerald-500');
      expect(component.getPassRateClass(80)).toBe('text-emerald-500');
    });

    it('should return text-amber-500 for rate >= 60 and < 80', () => {
      expect(component.getPassRateClass(75)).toBe('text-amber-500');
      expect(component.getPassRateClass(60)).toBe('text-amber-500');
    });

    it('should return text-rose-500 for rate < 60', () => {
      expect(component.getPassRateClass(59)).toBe('text-rose-500');
      expect(component.getPassRateClass(0)).toBe('text-rose-500');
    });
  });

  it('should handle null data in response', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/assessments/all`);
    
    req.flush({ success: true, data: null });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
