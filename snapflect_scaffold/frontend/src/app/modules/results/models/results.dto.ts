export interface CandidateResultDto {
  resultUuid: string;
  assessmentName: string;
  publishedAt: string;
  resultVersion: number;
  score: number | null;
  percentage: number | null;
  passFailStatus: 'PASS' | 'FAIL' | null;
}

export interface CompetencyDto {
  competencyUuid: string;
  competencyName: string;
  percentage: number;
  passed: boolean;
}

export interface ResultHistoryItemDto {
  resultUuid: string;
  assessmentName: string;
  attemptDate: string;
  percentage: number | null;
  passFailStatus: 'PASS' | 'FAIL' | null;
}

export interface ResultHistoryResponseDto {
  data: ResultHistoryItemDto[];
  meta: {
    currentPage: number;
    lastPage: number;
    total: number;
  }
}
