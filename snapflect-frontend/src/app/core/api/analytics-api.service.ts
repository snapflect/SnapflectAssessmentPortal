import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AnalyticsApiService extends BaseApiService {
  public getAssessmentTrends(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/trends', { params }); }
  public getCompletionMetrics(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/completion', { params }); }
  public getCompetencyHeatmaps(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/heatmaps', { params }); }
  public getScoreDistribution(params: any): Observable<any> { return this.http.get(this.baseUrl + '/analytics/distribution', { params }); }
}