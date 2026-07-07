import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription, Observable, tap, catchError, throwError } from 'rxjs';
import { DeliveryApiService } from '../../../core/api/delivery-api.service';
import { SessionStore } from '../../../shared/stores/session.store';
import { AttemptStore } from '../../../shared/stores/attempt.store';

@Injectable({ providedIn: 'root' })
export class DeliveryFacade {
  private api = inject(DeliveryApiService);
  private sessionStore = inject(SessionStore);
  public attemptStore = inject(AttemptStore);
  private router = inject(Router);
  
  private timerSub?: Subscription;
  private elapsedSub?: Subscription;

  public loadSessions() { return this.api.getSessions().pipe(tap(res => this.sessionStore.setSessions(res.data))); }
  
  public launchSession(sessionUuid: string): Observable<any> {
    return this.api.startAttempt(sessionUuid).pipe(
      tap(res => {
        const data = res.data || res;
        this.setAttemptState(data);
      })
    );
  }

  public loadAttempt(attemptUuid: string): Observable<any> {
    return this.api.getAttempt(attemptUuid).pipe(
      tap(res => {
        const data = res.data || res;
        this.setAttemptState(data);
      })
    );
  }

  public loadQuestions(attemptUuid: string): Observable<any> {
    return this.api.getQuestions(attemptUuid).pipe(
      tap(res => {
        const data = res.data || res;
        const qState = data.map((q: any) => ({
          uuid: q.uuid,
          is_answered: !!q.attributes?.candidate_answer || !!q.attributes?.selected_options,
          is_flagged: !!q.attributes?.is_flagged
        }));
        this.attemptStore.setQuestionMap(qState);
      })
    );
  }

  public navigateQuestion(attemptUuid: string, direction: 'next' | 'previous' | 'jump', currentQuestionUuid?: string): Observable<any> {
    return this.api.navigateQuestion(attemptUuid, direction, currentQuestionUuid);
  }

  public saveAnswer(attemptUuid: string, questionUuid: string, payload: any): Observable<any> {
    return this.api.saveAnswer(attemptUuid, { attempt_uuid: attemptUuid, attempt_question_uuid: questionUuid, ...payload }).pipe(
      tap(() => this.attemptStore.updateQuestionState(questionUuid, { is_answered: true }))
    );
  }

  public getQuestion(questionUuid: string): Observable<any> {
    return this.api.getQuestion(questionUuid);
  }

  public toggleFlag(attemptUuid: string, questionUuid: string, isFlagged: boolean): Observable<any> {
    return this.api.toggleFlag(attemptUuid, questionUuid, isFlagged).pipe(
      tap(() => this.attemptStore.updateQuestionState(questionUuid, { is_flagged: isFlagged }))
    );
  }

  public submitAttempt(attemptUuid: string): Observable<any> {
    this.attemptStore.setIsSubmitting(true);
    return this.api.submitAttempt(attemptUuid).pipe(
      tap((res) => {
        this.stopTimer();
        this.attemptStore.setSubmissionResult(res.data);
        this.attemptStore.setIsSubmitting(false);
      }),
      catchError(err => {
        this.attemptStore.setIsSubmitting(false);
        return throwError(() => err);
      })
    );
  }

  private setAttemptState(data: any) {
    this.attemptStore.setCurrentAttempt({
      uuid: data.uuid,
      session_uuid: data.attributes?.session_uuid,
      status: data.attributes?.status,
      started_at: data.attributes?.started_at,
      expires_at: data.attributes?.expires_at,
      time_limit_minutes: data.attributes?.time_limit_minutes,
      title: data.relationships?.assessment?.attributes?.title || 'Assessment'
    });

    if (['SUBMITTED', 'EXPIRED', 'COMPLETED'].includes(data.attributes?.status)) {
      this.stopTimer();
      this.router.navigate(['/delivery/attempts', data.uuid, 'submission']);
      return;
    }

    if (data.attributes?.expires_at) {
      this.startTimer(data.attributes.expires_at);
    } else {
      // Untimed assessment: start elapsed stopwatch
      this.startElapsedTimer(data.attributes?.started_at);
    }
  }

  private startTimer(expiresAtIso: string) {
    this.stopTimer();
    const expiresAt = new Date(expiresAtIso).getTime();

    this.timerSub = interval(1000).subscribe(() => {
      const now = Date.now();
      const diff = Math.floor((expiresAt - now) / 1000);

      if (diff <= 0) {
        this.attemptStore.setTimeRemaining(0);
        this.stopTimer();
        this.autoSubmitDueToTimeout();
      } else {
        this.attemptStore.setTimeRemaining(diff);
      }
    });
  }

  private stopTimer() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
    if (this.elapsedSub) {
      this.elapsedSub.unsubscribe();
      this.elapsedSub = undefined;
    }
  }

  private startElapsedTimer(startedAtIso?: string) {
    if (this.elapsedSub) {
      this.elapsedSub.unsubscribe();
    }
    const startedAt = startedAtIso ? new Date(startedAtIso).getTime() : Date.now();
    this.elapsedSub = interval(1000).subscribe(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      this.attemptStore.setElapsedSeconds(elapsed);
    });
  }

  private autoSubmitDueToTimeout() {
    const attempt = this.attemptStore.currentAttempt();
    if (!attempt || attempt.status !== 'IN_PROGRESS') return;

    this.submitAttempt(attempt.uuid).subscribe({
      next: () => this.router.navigate(['/delivery/attempts', attempt.uuid, 'submission']),
      error: () => {
        this.router.navigate(['/delivery/attempts', attempt.uuid, 'summary']);
      }
    });
  }
}