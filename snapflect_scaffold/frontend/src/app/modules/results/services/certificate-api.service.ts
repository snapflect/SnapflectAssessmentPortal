import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
// Reusing backend structure for frontend DTO
export interface CertificateDto {
  certificateUuid: string;
  verificationCode: string;
  status: 'VALID' | 'REVOKED';
  issuedAt: string;
  candidateName: string;
  assessmentName: string;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateApiService {
  private readonly BASE_URL = '/api/v1/certificates';

  constructor(private http: HttpClient) {}

  public getCertificate(certificateUuid: string): Observable<{ data: CertificateDto }> {
    return this.http.get<{ data: CertificateDto }>(`${this.BASE_URL}/${certificateUuid}`)
      .pipe(catchError(this.handleError));
  }

  public verifyCertificate(verificationCode: string): Observable<{ data: CertificateDto }> {
    return this.http.get<{ data: CertificateDto }>(`${this.BASE_URL}/verify/${verificationCode}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error && error.error.type) {
      return throwError(() => error.error);
    }
    return throwError(() => new Error('An error occurred communicating with the Certificate server.'));
  }
}
