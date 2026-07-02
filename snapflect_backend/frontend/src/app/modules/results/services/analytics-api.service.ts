import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { 
  AssessmentAnalyticsSummaryDto, 
  CompetencyAnalyticsSummaryDto, 
  QuestionAnalyticsSummaryDto,
  AnalyticsResponseDto 
} from '../models/analytics.dto';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService {
  private readonly BASE_URL = '/api/v1/admin/analytics';

  constructor(private http: HttpClient) {}

  public getAssessmentSummary(assessmentUuid: string): Observable<AnalyticsResponseDto<AssessmentAnalyticsSummaryDto>> {
    return this.http.get<AnalyticsResponseDto<AssessmentAnalyticsSummaryDto>>(`${this.BASE_URL}/assessments/${assessmentUuid}`)
      .pipe(catchError(this.handleError));
  }

  public getCompetencySummaries(assessmentUuid: string): Observable<AnalyticsResponseDto<CompetencyAnalyticsSummaryDto[]>> {
    return this.http.get<AnalyticsResponseDto<CompetencyAnalyticsSummaryDto[]>>(`${this.BASE_URL}/competencies/${assessmentUuid}`)
      .pipe(catchError(this.handleError));
  }

  public getQuestionSummaries(assessmentUuid: string): Observable<AnalyticsResponseDto<QuestionAnalyticsSummaryDto[]>> {
    return this.http.get<AnalyticsResponseDto<QuestionAnalyticsSummaryDto[]>>(`${this.BASE_URL}/questions/${assessmentUuid}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error && error.error.type) {
      return throwError(() => error.error);
    }
    return throwError(() => new Error('An error occurred while fetching analytics.'));
  }
}
