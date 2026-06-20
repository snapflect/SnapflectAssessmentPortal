import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class VerificationStore {
  private readonly _verificationResult = signal<any | null>(null);
  public readonly verificationResult = this._verificationResult.asReadonly();
  public setVerificationResult(data: any): void { this._verificationResult.set(data); }
}