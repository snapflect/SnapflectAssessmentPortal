import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentListPageComponent } from './assessment-list-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('AssessmentListPageComponent', () => {
  let component: AssessmentListPageComponent;
  let fixture: ComponentFixture<AssessmentListPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentListPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: { success: jasmine.createSpy(), error: jasmine.createSpy() } },
        { provide: ConfirmService, useValue: { confirm: jasmine.createSpy().and.returnValue(Promise.resolve(true)) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load assessments, types, and categories on init', () => {
    const reqAssessments = httpMock.expectOne(`${environment.apiUrl}/assessment/assessments?include=type,category&per_page=100`);
    expect(reqAssessments.request.method).toBe('GET');
    reqAssessments.flush({ data: [{ uuid: '123', attributes: { current_state: 'DRAFT', assessment_name: 'Test' } }] });

    const reqTypes = httpMock.expectOne(`${environment.apiUrl}/assessment/types?per_page=100`);
    expect(reqTypes.request.method).toBe('GET');
    reqTypes.flush({ data: [] });

    const reqCategories = httpMock.expectOne(`${environment.apiUrl}/assessment/categories?per_page=100`);
    expect(reqCategories.request.method).toBe('GET');
    reqCategories.flush({ data: [] });

    expect(component.assessments.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should filter assessments by status', () => {
    // Flush initial requests
    httpMock.expectOne(`${environment.apiUrl}/assessment/assessments?include=type,category&per_page=100`)
      .flush({ data: [
        { uuid: '1', attributes: { current_state: 'DRAFT', assessment_name: 'A1', assessment_code: 'A1' } },
        { uuid: '2', attributes: { current_state: 'PUBLISHED', assessment_name: 'A2', assessment_code: 'A2' } }
      ] });
    httpMock.expectOne(`${environment.apiUrl}/assessment/types?per_page=100`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/assessment/categories?per_page=100`).flush({ data: [] });

    component.setStatusFilter('PUBLISHED');
    expect(component.filteredAssessments.length).toBe(1);
    expect(component.filteredAssessments[0].uuid).toBe('2');
  });
});
