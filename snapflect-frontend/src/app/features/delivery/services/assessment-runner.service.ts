import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuestionState {
  uuid: string;
  is_answered: boolean;
  is_flagged: boolean;
}

export interface AttemptState {
  uuid: string;
  session_uuid: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  time_limit_minutes: number | null;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentRunnerService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // State
  public attempt = signal<AttemptState | null>(null);
  public timeRemainingSeconds = signal<number | null>(null);
  public questionMap = signal<QuestionState[]>([]);
  public isSubmitting = signal<boolean>(false);

  private timerSub?: Subscription;

  /**
   * Launch a new session, creating an attempt, and return the attempt UUID.
   */
  launchSession(sessionUuid: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/delivery/sessions/${sessionUuid}/launch`, {}).pipe(
      tap(res => {
        const data = res.data || res;
        this.setAttemptState(data);
      })
    );
  }

  /**
   * Load an existing attempt by UUID.
   */
  loadAttempt(attemptUuid: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/delivery/attempts/${attemptUuid}`).pipe(
      tap(res => {
        const data = res.data || res;
        this.setAttemptState(data);
      })
    );
  }

  /**
   * Load the list of questions for the summary view.
   */
  loadQuestions(attemptUuid: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/delivery/attempts/${attemptUuid}/questions`).pipe(
      tap(res => {
        const data = res.data || res;
        // Map backend questions to local state
        const qState: QuestionState[] = data.map((q: any) => ({
          uuid: q.uuid,
          is_answered: !!q.attributes?.candidate_answer || !!q.attributes?.selected_options,
          is_flagged: !!q.attributes?.is_flagged
        }));
        this.questionMap.set(qState);
      })
    );
  }

  /**
   * Get a specific question (jump)
   */
  getQuestion(questionUuid: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/delivery/questions/${questionUuid}`);
  }

  /**
   * Navigate next/prev using the attempt endpoint
   */
  navigateQuestion(attemptUuid: string, direction: 'next' | 'previous', currentQuestionUuid?: string): Observable<any> {
    let url = `${environment.apiUrl}/delivery/questions/${attemptUuid}/${direction}`;
    if (currentQuestionUuid) {
      url += `?current_question=${currentQuestionUuid}`;
    }
    return this.http.get<any>(url);
  }

  /**
   * Save an answer
   */
  saveAnswer(attemptUuid: string, questionUuid: string, payload: any): Observable<any> {
    // Standardize payload based on typical structure.
    return this.http.post<any>(`${environment.apiUrl}/delivery/answers`, {
      attempt_uuid: attemptUuid,
      question_uuid: questionUuid,
      ...payload
    }).pipe(
      tap(() => this.updateLocalQuestionState(questionUuid, { is_answered: true }))
    );
  }

  /**
   * Flag/Unflag a question
   */
  toggleFlag(questionUuid: string, isFlagged: boolean): Observable<any> {
    const endpoint = isFlagged ? 'flag' : 'unflag';
    return this.http.post<any>(`${environment.apiUrl}/delivery/questions/${questionUuid}/${endpoint}`, {}).pipe(
      tap(() => this.updateLocalQuestionState(questionUuid, { is_flagged: isFlagged }))
    );
  }

  /**
   * Final Submit
   */
  submitAttempt(attemptUuid: string): Observable<any> {
    this.isSubmitting.set(true);
    return this.http.post<any>(`${environment.apiUrl}/delivery/attempts/${attemptUuid}/submit`, {}).pipe(
      tap(() => {
        this.stopTimer();
        this.isSubmitting.set(false);
      }),
      catchError(err => {
        this.isSubmitting.set(false);
        return throwError(() => err);
      })
    );
  }

  // --- Internal State & Timer Management ---

  private setAttemptState(data: any) {
    this.attempt.set({
      uuid: data.uuid,
      session_uuid: data.attributes?.session_uuid,
      status: data.attributes?.status,
      started_at: data.attributes?.started_at,
      expires_at: data.attributes?.expires_at,
      time_limit_minutes: data.attributes?.time_limit_minutes,
      title: data.relationships?.assessment?.attributes?.title || 'Assessment'
    });

    if (data.attributes?.expires_at) {
      this.startTimer(data.attributes.expires_at);
    }
  }

  private updateLocalQuestionState(uuid: string, updates: Partial<QuestionState>) {
    this.questionMap.update(state => 
      state.map(q => q.uuid === uuid ? { ...q, ...updates } : q)
    );
  }

  private startTimer(expiresAtIso: string) {
    this.stopTimer();
    const expiresAt = new Date(expiresAtIso).getTime();

    this.timerSub = interval(1000).subscribe(() => {
      const now = Date.now();
      const diff = Math.floor((expiresAt - now) / 1000);

      if (diff <= 0) {
        this.timeRemainingSeconds.set(0);
        this.stopTimer();
        this.autoSubmitDueToTimeout();
      } else {
        this.timeRemainingSeconds.set(diff);
      }
    });
  }

  private stopTimer() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
  }

  private autoSubmitDueToTimeout() {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'IN_PROGRESS') return;

    // Trigger submission and route to submission page
    this.submitAttempt(attempt.uuid).subscribe({
      next: () => this.router.navigate(['/delivery/attempts', attempt.uuid, 'submission']),
      error: () => {
        // Fallback if network fails, just push to summary to let user retry
        this.router.navigate(['/delivery/attempts', attempt.uuid, 'summary']);
      }
    });
  }
}
