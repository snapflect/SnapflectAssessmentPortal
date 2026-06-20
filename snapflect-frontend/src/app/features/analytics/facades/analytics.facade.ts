import { Injectable, inject } from '@angular/core';
import { AnalyticsApiService } from '../../../core/api/analytics-api.service';
import { AnalyticsStore } from '../../../shared/stores/analytics.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class AnalyticsFacade {
  private api = inject(AnalyticsApiService);
  private store = inject(AnalyticsStore);
  public loadAssessmentTrends(params: any) { return this.api.getAssessmentTrends(params).pipe(tap(res => this.store.setMetrics(res.data))); }
}