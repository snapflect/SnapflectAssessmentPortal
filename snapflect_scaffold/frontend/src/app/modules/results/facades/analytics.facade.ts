import { Injectable } from '@angular/core';
import { AnalyticsStore } from '../state/analytics.store';
import { AnalyticsApiService } from '../services/analytics-api.service';
import { tap, finalize, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsFacade {
  constructor(
    public store: AnalyticsStore,
    private api: AnalyticsApiService
  ) {}

  public loadDashboard(assessmentUuid: string): void {
    this.store.setLoading(true);
    
    // ForkJoin allows O(1) concurrent fetching of materialized views
    forkJoin({
      summary: this.api.getAssessmentSummary(assessmentUuid),
      competencies: this.api.getCompetencySummaries(assessmentUuid),
      questions: this.api.getQuestionSummaries(assessmentUuid)
    }).pipe(
      tap({
        next: (responses) => {
          this.store.setAssessmentSummary(responses.summary.data);
          this.store.setCompetencySummaries(responses.competencies.data);
          this.store.setQuestionSummaries(responses.questions.data);
        },
        error: (err) => this.store.setError(err)
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }
}
