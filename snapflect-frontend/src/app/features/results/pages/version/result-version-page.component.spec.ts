import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultVersionPageComponent } from './result-version-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

describe('ResultVersionPageComponent', () => {
  let component: ResultVersionPageComponent;
  let fixture: ComponentFixture<ResultVersionPageComponent>;
  let httpMock: HttpTestingController;

  const mockVersions = [
    { version_number: 1, percentage_score: 80, pass_fail_status: 'PASS', created_date: '2026-07-04' },
    { version_number: 2, percentage_score: 90, pass_fail_status: 'PASS', created_date: '2026-07-05' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultVersionPageComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['uuid', '123-abc']]))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultVersionPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // triggers ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch versions', () => {
    expect(component).toBeTruthy();
    expect(component.uuid).toEqual('123-abc');
    expect(component.loading).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/results/123-abc/versions`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockVersions });

    expect(component.loading).toBeFalse();
    // Verify versions are sorted descending by version_number
    expect(component.versions.length).toBe(2);
    expect(component.versions[0].version_number).toBe(2);
    expect(component.versions[1].version_number).toBe(1);
  });

  it('should handle error when fetching versions', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/123-abc/versions`);
    req.error(new ErrorEvent('Network error'));

    expect(component.versions).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('should handle empty data', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/123-abc/versions`);
    req.flush({ success: true, data: null });

    expect(component.versions).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
