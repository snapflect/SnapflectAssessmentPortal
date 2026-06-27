export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string | string[];
  errorCode: string;
  traceId: string;
  timestamp: string;
}

export interface SnapshotQuestionLabel {
  text: string;
  type: 'single_choice' | 'multiple_choice' | string;
  sectionUuid: string | null;
}

export interface SnapshotMap {
  questions: Record<string, SnapshotQuestionLabel>;
  options: Record<string, string>;
}

export interface LaunchAttemptResponse {
  attemptUuid: string;
  snapshotUuid: string;
  randomizationSeed: string;
  questionOrder: string[];
  optionOrder: Record<string, string[]>;
  startedAt: string;
  expiresAt: string | null;
  snapshotMap: SnapshotMap;
}

export interface TimerStatusResponse {
  attemptUuid: string;
  remainingSeconds: number;
  expiresAt: string | null;
  serverTime: string;
  expired: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'SUBMITTED';
}

export interface AutoSaveResponse {
  questionUuid: string;
  answerUuid: string;
  serverDraftVersion: string;
  savedAt: string;
  success: boolean;
}

export interface ResumeResponse {
  attemptUuid: string;
  snapshotUuid: string;
  snapshotSchemaVersion: string;
  randomizationSeed: string;
  questionOrder: string[];
  optionOrder: Record<string, string[]>;
  draftAnswers: any[];
  remainingSeconds: number;
  expiresAt: string | null;
  serverTime: string;
  completionPercentage: number;
  snapshotMap: SnapshotMap;
}

export interface SubmissionResponse {
  attemptUuid: string;
  submissionUuid: string;
  submittedAt: string;
  finalStatus: string;
  answeredQuestions: number;
  totalQuestions: number;
  completionPercentage: number;
}

export interface AutoSaveRequestDto {
  questionUuid: string;
  clientDraftVersion: string;
  answerPayload: any;
}
