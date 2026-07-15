import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankListPageComponent } from './question-bank-list-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { UserStore } from '../../../../../shared/stores/user.store';
import { environment } from '../../../../../../environments/environment';

describe('QuestionBankListPageComponent', () => {
  let component: QuestionBankListPageComponent;
  let fixture: ComponentFixture<QuestionBankListPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionBankListPageComponent, HttpClientTestingModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ToastService, useValue: { success: jasmine.createSpy(), error: jasmine.createSpy() } },
        { provide: ConfirmService, useValue: { confirm: jasmine.createSpy().and.returnValue(Promise.resolve(true)) } },
        { provide: UserStore, useValue: { hasAnyRole: () => true, hasAnyPermission: () => true, hasPermission: () => true } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize and load banks', () => {
    const orgReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgReq.flush({ data: [] });

    const req = httpMock.expectOne(`${environment.apiUrl}/assessment/question-banks`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ uuid: '123', attributes: { bank_name: 'Core Concepts' } }] });

    expect(component.banks.length).toBe(1);
    expect(component.loading).toBeFalse();
  });
});


