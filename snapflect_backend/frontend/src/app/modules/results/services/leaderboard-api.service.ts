import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LeaderboardResponseDto } from '../models/leaderboard.dto';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardApiService {
  private readonly BASE_URL = '/api/v1/leaderboards';

  constructor(private http: HttpClient) {}

  public getLeaderboard(assessmentUuid: string): Observable<LeaderboardResponseDto> {
    return this.http.get<LeaderboardResponseDto>(`${this.BASE_URL}/${assessmentUuid}`)
      .pipe(catchError(this.handleError));
  }

  public getTopPerformers(assessmentUuid: string): Observable<LeaderboardResponseDto> {
    return this.http.get<LeaderboardResponseDto>(`${this.BASE_URL}/${assessmentUuid}/top`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error && error.error.type) {
      return throwError(() => error.error);
    }
    return throwError(() => new Error('An error occurred while fetching the leaderboard.'));
  }
}
