import { Injectable, signal, computed } from '@angular/core';
import { 
  AssessmentAnalyticsSummaryDto, 
  CompetencyAnalyticsSummaryDto, 
  QuestionAnalyticsSummaryDto 
} from '../models/analytics.dto';

export interface AnalyticsState {
  assessmentSummary: AssessmentAnalyticsSummaryDto | null;
  competencySummaries: CompetencyAnalyticsSummaryDto[];
  questionSummaries: QuestionAnalyticsSummaryDto[];
  isLoading: boolean;
  error: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsStore {
  private state = signal<AnalyticsState>({
    assessmentSummary: null,
    competencySummaries: [],
    questionSummaries: [],
    isLoading: false,
    error: null
  });

  // Base Selectors
  public readonly assessmentSummary = computed(() => this.state().assessmentSummary);
  public readonly competencySummaries = computed(() => this.state().competencySummaries);
  public readonly questionSummaries = computed(() => this.state().questionSummaries);
  public readonly isLoading = computed(() => this.state().isLoading);
  public readonly error = computed(() => this.state().error);

  // Derived KPI Selectors
  public readonly totalAttempts = computed(() => this.state().assessmentSummary?.totalAttempts || 0);
  public readonly passRatePercentage = computed(() => this.state().assessmentSummary?.passRatePercentage || 0);
  public readonly averageScorePercentage = computed(() => this.state().assessmentSummary?.averageScorePercentage || 0);

  public readonly topCompetency = computed(() => {
    const comps = this.state().competencySummaries;
    if (comps.length === 0) return null;
    return comps.reduce((prev, current) => (prev.averagePercentage > current.averagePercentage) ? prev : current);
  });

  public readonly weakestCompetency = computed(() => {
    const comps = this.state().competencySummaries;
    if (comps.length === 0) return null;
    return comps.reduce((prev, current) => (prev.averagePercentage < current.averagePercentage) ? prev : current);
  });

  public readonly mostFailedQuestion = computed(() => {
    const questions = this.state().questionSummaries;
    if (questions.length === 0) return null;
    return questions.reduce((prev, current) => (prev.passRatePercentage < current.passRatePercentage) ? prev : current);
  });

  // Actions
  public setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  public setError(error: any): void {
    this.state.update(s => ({ ...s, error, isLoading: false }));
  }

  public setAssessmentSummary(summary: AssessmentAnalyticsSummaryDto): void {
    this.state.update(s => ({ ...s, assessmentSummary: summary }));
  }

  public setCompetencySummaries(summaries: CompetencyAnalyticsSummaryDto[]): void {
    this.state.update(s => ({ 
      ...s, 
      // Sort descending by default for heatmap
      competencySummaries: [...summaries].sort((a, b) => b.averagePercentage - a.averagePercentage) 
    }));
  }

  public setQuestionSummaries(summaries: QuestionAnalyticsSummaryDto[]): void {
    this.state.update(s => ({ 
      ...s, 
      // Sort by lowest pass rate first (most difficult)
      questionSummaries: [...summaries].sort((a, b) => a.passRatePercentage - b.passRatePercentage) 
    }));
  }
}
