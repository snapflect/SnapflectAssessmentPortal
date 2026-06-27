import { Injectable, signal, computed } from '@angular/core';
import { CertificateDto } from '../services/certificate-api.service';

export interface CertificateState {
  certificate: CertificateDto | null;
  isLoading: boolean;
  error: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateStore {
  private state = signal<CertificateState>({
    certificate: null,
    isLoading: false,
    error: null
  });

  // Selectors
  public readonly certificate = computed(() => this.state().certificate);
  public readonly isLoading = computed(() => this.state().isLoading);
  public readonly error = computed(() => this.state().error);

  public readonly isValid = computed(() => this.state().certificate?.status === 'VALID');
  public readonly isRevoked = computed(() => this.state().certificate?.status === 'REVOKED');

  // Actions
  public setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  public setError(error: any): void {
    this.state.update(s => ({ ...s, error, isLoading: false, certificate: null }));
  }

  public setCertificate(cert: CertificateDto): void {
    this.state.update(s => ({ ...s, certificate: cert, isLoading: false, error: null }));
  }
}
