import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompetencyReportPageComponent } from './competency-report-page.component';
import { environment } from '../../../../../environments/environment';

describe('CompetencyReportPageComponent', () => {
  let component: CompetencyReportPageComponent;
  let fixture: ComponentFixture<CompetencyReportPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CompetencyReportPageComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CompetencyReportPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/competencies/all`);
    req.flush({ success: true, data: [] });
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/competencies/all`);
    expect(req.request.method).toBe('GET');
    
    const mockData = [
      {
        competency_name: 'Leadership',
        average_score: 85,
        candidates_evaluated: 20,
        proficient_count: 15
      }
    ];
    
    req.flush({ success: true, data: mockData });
    
    expect(component.data).toEqual(mockData);
    expect(component.loading).toBeFalse();
  });

  it('should handle error on init', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/competencies/all`);
    
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  describe('getProficiencyRate', () => {
    it('should calculate rate correctly', () => {
      const row = {
        competency_name: 'Tech',
        average_score: 80,
        candidates_evaluated: 10,
        proficient_count: 5
      };
      expect(component.getProficiencyRate(row)).toBe(50);
    });

    it('should return 0 if candidates_evaluated is 0', () => {
      const row = {
        competency_name: 'Tech',
        average_score: 80,
        candidates_evaluated: 0,
        proficient_count: 0
      };
      expect(component.getProficiencyRate(row)).toBe(0);
    });
  });

  it('should handle null data in response', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/reports/competencies/all`);
    
    req.flush({ success: true, data: null });
    
    expect(component.data).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
