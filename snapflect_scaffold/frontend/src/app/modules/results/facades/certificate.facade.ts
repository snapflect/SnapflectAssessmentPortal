import { Injectable } from '@angular/core';
import { CertificateStore } from '../state/certificate.store';
import { CertificateApiService } from '../services/certificate-api.service';
import { tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateFacade {
  constructor(
    public store: CertificateStore,
    private api: CertificateApiService
  ) {}

  public loadCertificate(certificateUuid: string): void {
    this.store.setLoading(true);
    this.api.getCertificate(certificateUuid).pipe(
      tap({
        next: (response) => this.store.setCertificate(response.data),
        error: (err) => this.store.setError(err)
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  public verifyCertificate(verificationCode: string): void {
    this.store.setLoading(true);
    this.api.verifyCertificate(verificationCode).pipe(
      tap({
        next: (response) => this.store.setCertificate(response.data),
        error: (err) => {
          // If the certificate is fully invalid (NOT_FOUND)
          if (err.status === 404) {
            this.store.setError({ title: 'Invalid Certificate', detail: 'The provided verification code does not match any known records.' });
          } else {
            this.store.setError(err);
          }
        }
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }
}
