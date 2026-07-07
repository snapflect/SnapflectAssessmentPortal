import { TestBed } from '@angular/core/testing';
import { CertificateStore } from './certificate.store';

describe('CertificateStore', () => {
  let store: CertificateStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CertificateStore]
    });
    store = TestBed.inject(CertificateStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty certificates and null currentCertificate', () => {
    expect(store.certificates()).toEqual([]);
    expect(store.currentCertificate()).toBeNull();
  });

  it('should update certificates when setCertificates is called', () => {
    const mockData = [{ id: 'cert1', name: 'Angular Expert' }];
    store.setCertificates(mockData);
    expect(store.certificates()).toEqual(mockData);
  });

  it('should update currentCertificate when setCurrentCertificate is called', () => {
    const mockCert = { id: 'cert2', name: 'React Expert' };
    store.setCurrentCertificate(mockCert);
    expect(store.currentCertificate()).toEqual(mockCert);
  });
});