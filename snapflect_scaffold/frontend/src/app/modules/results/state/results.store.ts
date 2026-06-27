import { Injectable, signal, computed } from '@angular/core';
import { CandidateResultDto, CompetencyDto, ResultHistoryItemDto } from '../models/results.dto';

export interface ResultsState {
  activeResult: CandidateResultDto | null;
  activeCompetencies: CompetencyDto[];
  history: ResultHistoryItemDto[];
  historyTotalPages: number;
  historyCurrentPage: number;
  isLoading: boolean;
  error: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class ResultsStore {
  private state = signal<ResultsState>({
    activeResult: null,
    activeCompetencies: [],
    history: [],
    historyTotalPages: 1,
    historyCurrentPage: 1,
    isLoading: false,
    error: null
  });

  // Selectors
  public readonly activeResult = computed(() => this.state().activeResult);
  public readonly activeCompetencies = computed(() => this.state().activeCompetencies);
  public readonly history = computed(() => this.state().history);
  public readonly isLoading = computed(() => this.state().isLoading);
  public readonly error = computed(() => this.state().error);

  // Derived Selectors enforcing Visibility Rules
  public readonly isScoreVisible = computed(() => this.state().activeResult?.score !== null);
  public readonly isPassFailVisible = computed(() => this.state().activeResult?.passFailStatus !== null);
  public readonly hasCompetencies = computed(() => this.state().activeCompetencies.length > 0);

  // Actions
  public setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  public setError(error: any): void {
    this.state.update(s => ({ ...s, error, isLoading: false }));
  }

  public setActiveResult(result: CandidateResultDto): void {
    this.state.update(s => ({ ...s, activeResult: result, isLoading: false, error: null }));
  }

  public setCompetencies(competencies: CompetencyDto[]): void {
    this.state.update(s => ({ ...s, activeCompetencies: competencies }));
  }

  public setHistory(items: ResultHistoryItemDto[], current: number, total: number): void {
    this.state.update(s => ({
      ...s,
      history: items,
      historyCurrentPage: current,
      historyTotalPages: total,
      isLoading: false,
      error: null
    }));
  }
}
