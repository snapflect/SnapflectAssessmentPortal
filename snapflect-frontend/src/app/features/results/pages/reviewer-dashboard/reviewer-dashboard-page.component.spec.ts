import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewerDashboardPageComponent } from './reviewer-dashboard-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../environments/environment';

describe('ReviewerDashboardPageComponent', () => {
  let component: ReviewerDashboardPageComponent;
  let fixture: ComponentFixture<ReviewerDashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewerDashboardPageComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewerDashboardPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch metrics on init', () => {
    fixture.detectChanges(); // calls ngOnInit
    expect(component).toBeTruthy();
    expect(component.loading).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/analytics/reviewer/summary`);
    expect(req.request.method).toBe('GET');

    const mockMetrics = { pending_reviews: 5, completed_reviews: 10 };
    req.flush({ data: mockMetrics });

    expect(component.metrics).toEqual(mockMetrics);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching metrics', () => {
    fixture.detectChanges(); // calls ngOnInit
    
    const req = httpMock.expectOne(`${environment.apiUrl}/analytics/reviewer/summary`);
    req.error(new ErrorEvent('Network error'));

    expect(component.metrics).toBeNull();
    expect(component.loading).toBeFalse();
  });
});
