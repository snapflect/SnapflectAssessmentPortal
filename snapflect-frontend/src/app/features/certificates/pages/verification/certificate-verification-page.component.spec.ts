import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificateVerificationPageComponent } from './certificate-verification-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

describe('CertificateVerificationPageComponent', () => {
  let component: CertificateVerificationPageComponent;
  let fixture: ComponentFixture<CertificateVerificationPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateVerificationPageComponent, HttpClientTestingModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateVerificationPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call api if code is empty', () => {
    component.code = '';
    component.verify();
    
    httpMock.expectNone(`${environment.apiUrl}/certificates/verify/`);
    expect(component.loading).toBeFalse();
  });

  it('should verify certificate successfully', () => {
    const mockResponse = {
      data: {
        certificateUuid: '123',
        verificationCode: 'ABC',
        status: 'VALID',
        issuedAt: '2023-01-01',
        candidateName: 'John',
        assessmentName: 'Test'
      }
    };

    component.code = 'ABC';
    component.verify();
    expect(component.loading).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/certificates/verify/ABC`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.result).toEqual(mockResponse.data);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
  });

  it('should handle verification error', () => {
    component.code = 'INVALID';
    component.verify();

    const req = httpMock.expectOne(`${environment.apiUrl}/certificates/verify/INVALID`);
    req.flush('Error', { status: 404, statusText: 'Not Found' });

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.result).toBeNull();
  });
});