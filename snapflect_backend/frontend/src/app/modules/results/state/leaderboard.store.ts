import { Injectable, signal, computed } from '@angular/core';
import { LeaderboardEntryDto } from '../models/leaderboard.dto';

export interface LeaderboardState {
  entries: LeaderboardEntryDto[];
  isLoading: boolean;
  error: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardStore {
  private state = signal<LeaderboardState>({
    entries: [],
    isLoading: false,
    error: null
  });

  // Selectors
  public readonly entries = computed(() => this.state().entries);
  public readonly isLoading = computed(() => this.state().isLoading);
  public readonly error = computed(() => this.state().error);

  // Derived: Current User's Entry
  public readonly currentUserEntry = computed(() => {
    return this.state().entries.find(e => e.isCurrentUser) || null;
  });

  // Actions
  public setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  public setError(error: any): void {
    this.state.update(s => ({ ...s, error, isLoading: false }));
  }

  public setEntries(entries: LeaderboardEntryDto[]): void {
    this.state.update(s => ({ ...s, entries, isLoading: false, error: null }));
  }
}
