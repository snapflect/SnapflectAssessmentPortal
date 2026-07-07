import { TestBed } from '@angular/core/testing';
import { CertificateFacade } from './certificate.facade';
import { CertificateApiService } from '../../../core/api/certificate-api.service';
import { CertificateStore } from '../../../shared/stores/certificate.store';
import { VerificationStore } from '../../../shared/stores/verification.store';
import { of } from 'rxjs';

describe('CertificateFacade', () => {
  let facade: CertificateFacade;
  let apiSpy: jasmine.SpyObj<CertificateApiService>;
  let storeSpy: jasmine.SpyObj<CertificateStore>;
  let vStoreSpy: jasmine.SpyObj<VerificationStore>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('CertificateApiService', [
      'getCertificates',
      'getCertificate',
      'downloadCertificate',
      'verifyCertificate'
    ]);
    storeSpy = jasmine.createSpyObj('CertificateStore', [
      'setCertificates',
      'setCurrentCertificate'
    ]);
    vStoreSpy = jasmine.createSpyObj('VerificationStore', [
      'setVerificationResult'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CertificateFacade,
        { provide: CertificateApiService, useValue: apiSpy },
        { provide: CertificateStore, useValue: storeSpy },
        { provide: VerificationStore, useValue: vStoreSpy }
      ]
    });

    facade = TestBed.inject(CertificateFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load certificates and update store', (done) => {
    const mockData = { data: [{ id: '1' }] } as any;
    apiSpy.getCertificates.and.returnValue(of(mockData));

    facade.loadCertificates().subscribe(() => {
      expect(apiSpy.getCertificates).toHaveBeenCalled();
      expect(storeSpy.setCertificates).toHaveBeenCalledWith(mockData.data);
      done();
    });
  });

  it('should load single certificate and update store', (done) => {
    const mockData = { data: { uuid: '123' } } as any;
    apiSpy.getCertificate.and.returnValue(of(mockData));

    facade.loadCertificate('123').subscribe(() => {
      expect(apiSpy.getCertificate).toHaveBeenCalledWith('123');
      expect(storeSpy.setCurrentCertificate).toHaveBeenCalledWith(mockData.data);
      done();
    });
  });

  it('should call downloadCertificate on API', () => {
    apiSpy.downloadCertificate.and.returnValue(of(new Blob()) as any);

    facade.downloadCertificate('123');
    expect(apiSpy.downloadCertificate).toHaveBeenCalledWith('123');
  });

  it('should verify certificate and update verification store', (done) => {
    const mockData = { data: { status: 'VALID' } } as any;
    apiSpy.verifyCertificate.and.returnValue(of(mockData));

    facade.verifyCertificate('123').subscribe(() => {
      expect(apiSpy.verifyCertificate).toHaveBeenCalledWith('123');
      expect(vStoreSpy.setVerificationResult).toHaveBeenCalledWith(mockData.data);
      done();
    });
  });
});