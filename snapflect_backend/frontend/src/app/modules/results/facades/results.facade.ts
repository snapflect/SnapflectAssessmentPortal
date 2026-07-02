import { Injectable } from '@angular/core';
import { ResultsStore } from '../state/results.store';
import { ResultsApiService } from '../services/results-api.service';
import { tap, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsFacade {
  constructor(
    public store: ResultsStore,
    private api: ResultsApiService
  ) {}

  public loadResult(resultUuid: string): void {
    this.store.setLoading(true);
    
    this.api.getResult(resultUuid).pipe(
      tap({
        next: (response) => this.store.setActiveResult(response.data),
        error: (err) => this.store.setError(err)
      }),
      // Once the result loads, attempt to load competencies (API will 403 if visibility is off, which is expected)
      tap({
        next: () => this.loadCompetencies(resultUuid)
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  private loadCompetencies(resultUuid: string): void {
    this.api.getCompetencies(resultUuid).pipe(
      tap({
        next: (response) => this.store.setCompetencies(response.data),
        error: (err) => {
          // If 403 Forbidden due to `show_competencies = false`, gracefully ignore.
          if (err.status === 403) {
            this.store.setCompetencies([]);
          } else {
             // Let other errors pass silently to not break the main result view
             console.error('Failed to load competencies', err);
          }
        }
      })
    ).subscribe();
  }

  public loadHistory(page: number = 1): void {
    this.store.setLoading(true);
    this.api.getHistory(page).pipe(
      tap({
        next: (response) => this.store.setHistory(response.data, response.meta.currentPage, response.meta.total),
        error: (err) => this.store.setError(err)
      })
    ).subscribe();
  }
}
