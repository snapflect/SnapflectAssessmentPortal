import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultDetailPageComponent } from './result-detail-page.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

describe('ResultDetailPageComponent', () => {
  let component: ResultDetailPageComponent;
  let fixture: ComponentFixture<ResultDetailPageComponent>;
  let httpMock: HttpTestingController;

  const mockResultDetail = {
    id: 'test-uuid',
    attributes: {
      total_score: 85,
      percentage_score: 85,
      is_passed: true,
      status: 'PUBLISHED',
      scored_at: '2026-07-04T12:00:00Z',
      result_version: 1
    },
    relationships: {
      candidate: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe'
        }
      },
      assessment: {
        attributes: {
          title: 'Angular Basics'
        }
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultDetailPageComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => (key === 'uuid' ? 'test-uuid' : null) })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultDetailPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // Triggers ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const req = httpMock.expectOne(`${environment.apiUrl}/results/test-uuid`);
    req.flush({ success: true, data: mockResultDetail });
  });

  it('should fetch result detail on init', () => {
    expect(component.loading).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/results/test-uuid`);
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, data: mockResultDetail });

    expect(component.result).toEqual(mockResultDetail as any);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching result detail', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/test-uuid`);
    req.error(new ProgressEvent('Network error'));

    expect(component.result).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should display "Result not found." if result is null after loading', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/test-uuid`);
    req.flush({ success: true, data: null }); // Simulating not found payload
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Result not found.');
  });
});