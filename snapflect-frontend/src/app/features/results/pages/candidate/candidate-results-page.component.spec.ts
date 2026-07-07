import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateResultsPageComponent } from './candidate-results-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';
import { RouterTestingModule } from '@angular/router/testing';

describe('CandidateResultsPageComponent', () => {
  let component: CandidateResultsPageComponent;
  let fixture: ComponentFixture<CandidateResultsPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateResultsPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateResultsPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch results on init', () => {
    fixture.detectChanges(); // calls ngOnInit
    expect(component).toBeTruthy();
    expect(component.loading).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/candidates/results/history`);
    expect(req.request.method).toBe('GET');

    const mockResults = [{ resultUuid: 'uuid1' }];
    req.flush({ data: mockResults });

    expect(component.results).toEqual(mockResults as any);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching results', () => {
    fixture.detectChanges(); // calls ngOnInit
    
    const req = httpMock.expectOne(`${environment.apiUrl}/candidates/results/history`);
    req.error(new ErrorEvent('Network error'));

    expect(component.results).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('should fallback to empty array if no data in response', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/candidates/results/history`);
    req.flush({});
    
    expect(component.results).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  describe('Styling helpers', () => {
    it('getStatusBarClass should return correct class', () => {
      expect(component.getStatusBarClass('PASS')).toBe('bg-emerald-500');
      expect(component.getStatusBarClass('FAIL')).toBe('bg-red-500');
      expect(component.getStatusBarClass(null)).toBe('bg-brand');
      expect(component.getStatusBarClass('OTHER')).toBe('bg-brand');
    });

    it('getBadgeClass should return correct class', () => {
      expect(component.getBadgeClass('PASS')).toContain('bg-emerald-500/10 text-emerald-400');
      expect(component.getBadgeClass('FAIL')).toContain('bg-red-500/10 text-red-400');
      expect(component.getBadgeClass(null)).toContain('bg-slate-500/10 text-slate-400');
    });

    it('getCircleClass should return correct class', () => {
      expect(component.getCircleClass('PASS')).toContain('border-emerald-500/20 shadow-emerald-500/10 text-emerald-500');
      expect(component.getCircleClass('FAIL')).toContain('border-red-500/20 shadow-red-500/10 text-red-500');
      expect(component.getCircleClass(null)).toContain('border-brand/20 shadow-brand/10 text-brand');
    });
  });
});
