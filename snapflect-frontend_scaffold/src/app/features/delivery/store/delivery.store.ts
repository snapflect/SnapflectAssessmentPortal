import { Injectable, signal, computed } from '@angular/core';
import { ResumeResponse, LaunchAttemptResponse, TimerStatusResponse, AutoSaveResponse, SubmissionResponse, SnapshotMap } from '../../../core/models/execution.dto';

export interface DeliveryState {
  attemptUuid: string | null;
  snapshotUuid: string | null;
  questionOrder: string[];
  optionOrder: Record<string, string[]>;
  draftAnswers: any[];
  remainingSeconds: number;
  status: 'CREATED' | 'ACTIVE' | 'EXPIRED' | 'SUBMITTED' | null;
  expired: boolean;
  serverTime: string | null;
  snapshotSchemaVersion: string | null;
  completionPercentage: number;
  submissionState: 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';
  snapshotMap: SnapshotMap | null;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryStore {
  private state = signal<DeliveryState>({
    attemptUuid: null,
    snapshotUuid: null,
    questionOrder: [],
    optionOrder: {},
    draftAnswers: [],
    remainingSeconds: 0,
    status: null,
    expired: false,
    serverTime: null,
    snapshotSchemaVersion: null,
    completionPercentage: 0,
    submissionState: 'IDLE',
    snapshotMap: null
  });

  public readonly attemptUuid = computed(() => this.state().attemptUuid);
  public readonly remainingSeconds = computed(() => this.state().remainingSeconds);
  public readonly expired = computed(() => this.state().expired);
  public readonly status = computed(() => this.state().status);
  public readonly submissionState = computed(() => this.state().submissionState);
  public readonly draftAnswers = computed(() => this.state().draftAnswers);
  public readonly questionOrder = computed(() => this.state().questionOrder);
  public readonly optionOrder = computed(() => this.state().optionOrder);
  public readonly completionPercentage = computed(() => this.state().completionPercentage);
  public readonly snapshotMap = computed(() => this.state().snapshotMap);

  setAttemptFromLaunch(response: LaunchAttemptResponse) {
    this.state.update(s => ({
      ...s,
      attemptUuid: response.attemptUuid,
      snapshotUuid: response.snapshotUuid,
      questionOrder: response.questionOrder,
      optionOrder: response.optionOrder,
      status: 'ACTIVE',
      expired: false,
      snapshotMap: response.snapshotMap ?? null
    }));
  }

  setAttemptFromResume(response: ResumeResponse) {
    this.state.update(s => ({
      ...s,
      attemptUuid: response.attemptUuid,
      snapshotUuid: response.snapshotUuid,
      snapshotSchemaVersion: response.snapshotSchemaVersion,
      questionOrder: response.questionOrder,
      optionOrder: response.optionOrder,
      draftAnswers: response.draftAnswers,
      remainingSeconds: response.remainingSeconds,
      serverTime: response.serverTime,
      completionPercentage: response.completionPercentage,
      snapshotMap: response.snapshotMap ?? null
    }));
  }

  updateTimer(response: TimerStatusResponse) {
    this.state.update(s => ({
      ...s,
      remainingSeconds: response.remainingSeconds,
      serverTime: response.serverTime,
      expired: response.expired,
      status: response.status
    }));
  }

  recordSaveSuccess(response: AutoSaveResponse) {
    this.state.update(s => {
      // In a real app we'd map this specific draft back into draftAnswers if needed
      return { ...s };
    });
  }

  updateDraftAnswer(questionUuid: string, answerPayload: any) {
    this.state.update(s => {
      const drafts = [...s.draftAnswers];
      const index = drafts.findIndex(d => (d.questionUuid || (d as any).question_uuid) === questionUuid);
      
      if (index >= 0) {
        drafts[index] = { ...drafts[index], answerPayload };
      } else {
        drafts.push({ questionUuid, answerPayload, version: 1 } as any);
      }
      
      return { ...s, draftAnswers: drafts };
    });
  }

  setSubmissionState(state: 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR') {
    this.state.update(s => ({ ...s, submissionState: state }));
  }

  finalizeSubmission(response: SubmissionResponse) {
    this.state.update(s => ({
      ...s,
      status: 'SUBMITTED',
      completionPercentage: response.completionPercentage,
      submissionState: 'SUCCESS'
    }));
  }
}
