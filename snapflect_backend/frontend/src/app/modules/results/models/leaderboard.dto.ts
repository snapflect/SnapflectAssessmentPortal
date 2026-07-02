export interface LeaderboardEntryDto {
  rank: number;
  candidateName: string;
  score: number;
  timeTakenSeconds: number;
  isCurrentUser: boolean;
  rankSnapshotDate?: string;
}

export interface LeaderboardResponseDto {
  data: LeaderboardEntryDto[];
}
