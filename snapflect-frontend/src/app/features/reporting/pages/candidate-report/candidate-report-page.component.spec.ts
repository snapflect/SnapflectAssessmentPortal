import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CandidateReportPageComponent } from './candidate-report-page.component';
import { environment } from '../../../../../environments/environment';

describe('CandidateReportPageComponent', () => {
  let component: CandidateReportPageComponent;
  let fixture: ComponentFixture<CandidateReportPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CandidateReportPageComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CandidateReportPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/candidates/all`);
    req.flush({ success: true, data: [] });
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/candidates/all`);
    expect(req.request.method).toBe('GET');
    
    const mockData = [
      {
        candidate_name: 'John Doe',
        email: 'john@example.com',
        assessments_taken: 5,
        average_score: 90,
        passed_count: 5
      }
    ];
    
    req.flush({ success: true, data: mockData });
    
    expect(component.data).toEqual(mockData);
    expect(component.loading).toBeFalse();
  });

  it('should handle error on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/candidates/all`);
    
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('should handle null data in response', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/candidates/all`);
    
    req.flush({ success: true, data: null });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
