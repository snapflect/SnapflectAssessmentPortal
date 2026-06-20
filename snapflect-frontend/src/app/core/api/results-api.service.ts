import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ResultsApiService extends BaseApiService {
  public getResults(): Observable<any> { return this.http.get(this.baseUrl + '/results'); }
  public getResult(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid); }
  public getVersions(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/versions'); }
  public getPublication(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/publication'); }
  public getManualReviews(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/results/' + uuid + '/manual-reviews'); }
}