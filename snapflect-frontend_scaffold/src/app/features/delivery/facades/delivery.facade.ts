import { Injectable, inject } from '@angular/core';
import { ExecutionApiService } from '../../../core/api/execution-api.service';
import { DeliveryStore } from '../store/delivery.store';
import { AutoSaveService } from '../services/auto-save.service';
import { TimerSyncService } from '../services/timer-sync.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryFacade {
  private api = inject(ExecutionApiService);
  private store = inject(DeliveryStore);
  private autoSaveService = inject(AutoSaveService);
  private timerSync = inject(TimerSyncService);

  public launchAttempt(assessmentUuid: string) { 
    return this.api.launchAssessment(assessmentUuid).pipe(
      tap(res => {
        this.store.setAttemptFromLaunch(res);
        this.timerSync.startPolling(res.attemptUuid);
      })
    ); 
  }

  public resumeAttempt(attemptUuid: string) {
    return this.api.resumeAttempt(attemptUuid).pipe(
      tap(res => {
        this.store.setAttemptFromResume(res);
        this.timerSync.startPolling(res.attemptUuid);
      })
    );
  }

  public autoSave(questionUuid: string, clientDraftVersion: string, payload: any) {
    const attemptUuid = this.store.attemptUuid();
    if (attemptUuid) {
      this.autoSaveService.triggerSave(attemptUuid, questionUuid, clientDraftVersion, payload);
    }
  }

  public submitAttempt() {
    const attemptUuid = this.store.attemptUuid();
    if (!attemptUuid) return of(null);
    
    this.store.setSubmissionState('SUBMITTING');
    this.timerSync.stopPolling();
    
    return this.api.submitAttempt(attemptUuid).pipe(
      tap(res => this.store.finalizeSubmission(res)),
      catchError(err => {
        this.store.setSubmissionState('ERROR');
        return of(null);
      })
    );
  }

  public getTimer(attemptUuid: string) {
    return this.api.getTimer(attemptUuid).pipe(
      tap(res => this.store.updateTimer(res))
    );
  }
}