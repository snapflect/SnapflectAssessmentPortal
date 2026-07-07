import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CertificateApiService } from './certificate-api.service';
import { environment } from '../../../environments/environment';

describe('CertificateApiService', () => {
  let service: CertificateApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CertificateApiService]
    });
    service = TestBed.inject(CertificateApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get certificates', () => {
    const mockResponse = { data: 'certificates' };
    service.getCertificates().subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/certificates`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get certificate by uuid', () => {
    const mockUuid = '123';
    const mockResponse = { data: 'certificate' };
    service.getCertificate(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/certificates/${mockUuid}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should download certificate', () => {
    const mockUuid = '123';
    const mockBlob = new Blob(['content'], { type: 'application/pdf' });
    service.downloadCertificate(mockUuid).subscribe(res => expect(res).toEqual(mockBlob));
    const req = httpMock.expectOne(`${baseUrl}/certificates/${mockUuid}/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should verify certificate', () => {
    const mockUuid = '123';
    const mockResponse = { valid: true };
    service.verifyCertificate(mockUuid).subscribe(res => expect(res).toEqual(mockResponse));
    const req = httpMock.expectOne(`${baseUrl}/certificates/${mockUuid}/verify`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
