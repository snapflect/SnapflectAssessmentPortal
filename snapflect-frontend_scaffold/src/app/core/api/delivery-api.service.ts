import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class DeliveryApiService extends BaseApiService {
  public getSessions(): Observable<any> { return this.http.get(this.baseUrl + '/delivery/sessions'); }
  public startAttempt(sessionUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/sessions/' + sessionUuid + '/attempts', {}); }
  public getAttempt(attemptUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/delivery/attempts/' + attemptUuid); }
  public saveAnswer(attemptUuid: string, payload: any): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/answers', payload); }
  public submitAttempt(attemptUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/submit', {}); }
}