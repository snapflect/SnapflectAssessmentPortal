export interface AssessmentAnalyticsSummaryDto {
  assessmentUuid: string;
  totalAttempts: number;
  passRatePercentage: number;
  averageScorePercentage: number;
}

export interface CompetencyAnalyticsSummaryDto {
  competencyUuid: string;
  competencyName: string;
  averagePercentage: number;
}

export interface QuestionAnalyticsSummaryDto {
  questionUuid: string;
  questionExcerpt: string; // Brief text for UI rendering
  totalResponses: number;
  passRatePercentage: number;
}

export interface AnalyticsResponseDto<T> {
  data: T;
}
