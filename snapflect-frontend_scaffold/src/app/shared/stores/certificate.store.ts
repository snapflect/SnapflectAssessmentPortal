import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CertificateStore {
  private readonly _certificates = signal<any[]>([]);
  private readonly _currentCertificate = signal<any | null>(null);
  public readonly certificates = this._certificates.asReadonly();
  public readonly currentCertificate = this._currentCertificate.asReadonly();
  public setCertificates(data: any[]): void { this._certificates.set(data); }
  public setCurrentCertificate(data: any): void { this._currentCertificate.set(data); }
}