import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class CertificateApiService extends BaseApiService {
  public getCertificates(): Observable<any> { return this.http.get(this.baseUrl + '/certificates'); }
  public getCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid); }
  public downloadCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid + '/download', { responseType: 'blob' }); }
  public verifyCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid + '/verify'); }
}