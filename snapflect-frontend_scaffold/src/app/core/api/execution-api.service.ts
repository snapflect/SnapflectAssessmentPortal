import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LaunchAttemptResponse,
  TimerStatusResponse,
  AutoSaveRequestDto,
  AutoSaveResponse,
  ResumeResponse,
  SubmissionResponse
} from '../models/execution.dto';

@Injectable({
  providedIn: 'root'
})
export class ExecutionApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1';

  public launchAssessment(assessmentUuid: string): Observable<LaunchAttemptResponse> {
    return this.http.post<LaunchAttemptResponse>(`${this.baseUrl}/assessments/${assessmentUuid}/launch`, {});
  }

  public getTimer(attemptUuid: string): Observable<TimerStatusResponse> {
    return this.http.get<TimerStatusResponse>(`${this.baseUrl}/attempts/${attemptUuid}/timer`);
  }

  public autoSave(attemptUuid: string, payload: AutoSaveRequestDto): Observable<AutoSaveResponse> {
    return this.http.post<AutoSaveResponse>(`${this.baseUrl}/attempts/${attemptUuid}/save`, payload);
  }

  public resumeAttempt(attemptUuid: string): Observable<ResumeResponse> {
    return this.http.get<ResumeResponse>(`${this.baseUrl}/attempts/${attemptUuid}/resume`);
  }

  public submitAttempt(attemptUuid: string): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${this.baseUrl}/attempts/${attemptUuid}/submit`, {});
  }
}
