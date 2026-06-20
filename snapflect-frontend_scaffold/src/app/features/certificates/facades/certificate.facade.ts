import { Injectable, inject } from '@angular/core';
import { CertificateApiService } from '../../../core/api/certificate-api.service';
import { CertificateStore } from '../../../shared/stores/certificate.store';
import { VerificationStore } from '../../../shared/stores/verification.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class CertificateFacade {
  private api = inject(CertificateApiService);
  private store = inject(CertificateStore);
  private vStore = inject(VerificationStore);
  public loadCertificates() { return this.api.getCertificates().pipe(tap(res => this.store.setCertificates(res.data))); }
  public loadCertificate(uuid: string) { return this.api.getCertificate(uuid).pipe(tap(res => this.store.setCurrentCertificate(res.data))); }
  public downloadCertificate(uuid: string) { return this.api.downloadCertificate(uuid); }
  public verifyCertificate(uuid: string) { return this.api.verifyCertificate(uuid).pipe(tap(res => this.vStore.setVerificationResult(res.data))); }
}