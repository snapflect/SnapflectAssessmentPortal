import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionListPageComponent } from './question-list-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { UserStore } from '../../../../../shared/stores/user.store';
import { environment } from '../../../../../../environments/environment';

describe('QuestionListPageComponent', () => {
  let component: QuestionListPageComponent;
  let fixture: ComponentFixture<QuestionListPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: { success: jasmine.createSpy(), error: jasmine.createSpy() } },
        { provide: ConfirmService, useValue: { confirm: jasmine.createSpy().and.returnValue(Promise.resolve(true)) } },
        { provide: UserStore, useValue: { hasAnyRole: () => true } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize and load banks and questions', () => {
    const reqBanks = httpMock.expectOne(`${environment.apiUrl}/assessment/question-banks?per_page=100`);
    expect(reqBanks.request.method).toBe('GET');
    reqBanks.flush({ data: [{ uuid: 'bank1', attributes: { bank_name: 'Bank 1' } }] });

    const reqQuestions = httpMock.expectOne(`${environment.apiUrl}/assessment/questions?include=questionBank`);
    expect(reqQuestions.request.method).toBe('GET');
    reqQuestions.flush({ data: [{ uuid: 'q1', attributes: { question_code: 'Q1' } }] });

    const reqCompetencies = httpMock.expectOne(`${environment.apiUrl}/assessment/competencies?per_page=100`);
    reqCompetencies.flush({ data: [] });

    const reqTags = httpMock.expectOne(`${environment.apiUrl}/assessment/tags?per_page=100`);
    reqTags.flush({ data: [] });

    expect(component.banks.length).toBe(1);
    expect(component.questions.length).toBe(1);
    expect(component.loading).toBeFalse();
  });
});
