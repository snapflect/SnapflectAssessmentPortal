import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ReportingApiService extends BaseApiService {
  public getAssessmentReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/assessments', { params }); }
  public getCompetencyReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/competencies', { params }); }
  public getPassFailReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/pass-fail', { params }); }
  public getCandidateReport(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/candidates', { params }); }
  public exportCsv(params: any): Observable<any> { return this.http.get(this.baseUrl + '/reports/export/csv', { params, responseType: 'blob' }); }
}