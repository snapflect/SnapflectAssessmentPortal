import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class GovernanceApiService extends BaseApiService {
  public getOrganizations(): Observable<any> { return this.http.get(this.baseUrl + '/organizations'); }
  public getDepartments(): Observable<any> { return this.http.get(this.baseUrl + '/departments'); }
  public getRoles(): Observable<any> { return this.http.get(this.baseUrl + '/roles'); }
  public getPermissions(): Observable<any> { return this.http.get(this.baseUrl + '/permissions'); }
  public getUsers(): Observable<any> { return this.http.get(this.baseUrl + '/users'); }
}