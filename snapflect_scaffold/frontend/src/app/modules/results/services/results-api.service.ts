import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CandidateResultDto, CompetencyDto, ResultHistoryResponseDto } from '../models/results.dto';

@Injectable({
  providedIn: 'root'
})
export class ResultsApiService {
  private readonly BASE_URL = '/api/v1/candidates/results';

  constructor(private http: HttpClient) {}

  public getResult(resultUuid: string): Observable<{ data: CandidateResultDto }> {
    return this.http.get<{ data: CandidateResultDto }>(`${this.BASE_URL}/${resultUuid}`)
      .pipe(catchError(this.handleError));
  }

  public getCompetencies(resultUuid: string): Observable<{ data: CompetencyDto[] }> {
    return this.http.get<{ data: CompetencyDto[] }>(`${this.BASE_URL}/${resultUuid}/competencies`)
      .pipe(catchError(this.handleError));
  }

  public getHistory(page: number = 1): Observable<ResultHistoryResponseDto> {
    return this.http.get<ResultHistoryResponseDto>(`${this.BASE_URL}/history?page=${page}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // Passes RFC7807 problem details to the Store layer
    if (error.error && error.error.type) {
      return throwError(() => error.error);
    }
    return throwError(() => new Error('An unknown error occurred while fetching results.'));
  }
}
