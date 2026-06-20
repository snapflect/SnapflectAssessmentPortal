import { Injectable, inject } from '@angular/core';
import { ResultsApiService } from '../../../core/api/results-api.service';
import { ResultsStore } from '../../../shared/stores/results.store';
import { ResultVersionStore } from '../../../shared/stores/result-version.store';
import { PublicationStore } from '../../../shared/stores/publication.store';
import { ManualReviewStore } from '../../../shared/stores/manual-review.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class ResultsFacade {
  private api = inject(ResultsApiService);
  private resultsStore = inject(ResultsStore);
  private versionStore = inject(ResultVersionStore);
  private publicationStore = inject(PublicationStore);
  private manualReviewStore = inject(ManualReviewStore);
  public loadResults() { return this.api.getResults().pipe(tap(res => this.resultsStore.setResults(res.data))); }
  public loadResult(uuid: string) { return this.api.getResult(uuid).pipe(tap(res => this.resultsStore.setCurrentResult(res.data))); }
  public loadVersions(uuid: string) { return this.api.getVersions(uuid).pipe(tap(res => this.versionStore.setVersions(res.data))); }
  public loadPublication(uuid: string) { return this.api.getPublication(uuid).pipe(tap(res => this.publicationStore.setPublication(res.data))); }
  public loadManualReviews(uuid: string) { return this.api.getManualReviews(uuid).pipe(tap(res => this.manualReviewStore.setReviews(res.data))); }
}