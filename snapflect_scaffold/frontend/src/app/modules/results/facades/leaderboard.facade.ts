import { Injectable } from '@angular/core';
import { LeaderboardStore } from '../state/leaderboard.store';
import { LeaderboardApiService } from '../services/leaderboard-api.service';
import { tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardFacade {
  constructor(
    public store: LeaderboardStore,
    private api: LeaderboardApiService
  ) {}

  public loadLeaderboard(assessmentUuid: string, topOnly: boolean = false): void {
    this.store.setLoading(true);
    
    const request$ = topOnly 
      ? this.api.getTopPerformers(assessmentUuid) 
      : this.api.getLeaderboard(assessmentUuid);

    request$.pipe(
      tap({
        next: (response) => this.store.setEntries(response.data),
        error: (err) => {
          // If 403 Forbidden due to `leaderboard_enabled = false`, silently wipe state or log it
          if (err.status === 403) {
            this.store.setEntries([]);
            this.store.setError(err);
          } else {
             this.store.setError(err);
          }
        }
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }
}
