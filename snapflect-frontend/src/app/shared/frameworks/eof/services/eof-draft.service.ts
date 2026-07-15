import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EofDraftService {
  private http = inject(HttpClient);
  
  private draftUpdateSubject = new Subject<{ entityId: string, entityType: string, payload: any }>();
  private draftSubscription?: Subscription;

  // Emits when a draft save completes
  public draftSaved$ = new Subject<Date>();
  public isSaving$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initAutosave();
  }

  private initAutosave() {
    this.draftSubscription = this.draftUpdateSubject.pipe(
      debounceTime(2000), // 2-second debounce
      // distinctUntilChanged might need custom deep compare if payloads are complex
    ).subscribe(({ entityId, entityType, payload }) => {
      this.persistDraft(entityId, entityType, payload);
    });
  }

  public registerDraftUpdate(entityId: string, entityType: string, payload: any) {
    this.draftUpdateSubject.next({ entityId, entityType, payload });
  }

  private persistDraft(entityId: string, entityType: string, payload: any) {
    this.isSaving$.next(true);
    this.http.post(`${environment.apiUrl}/governance/drafts/${entityType}/${entityId}`, { payload }).subscribe({
      next: () => {
        this.draftSaved$.next(new Date());
        this.isSaving$.next(false);
      },
      error: (err) => {
        console.error('Failed to save draft', err);
        this.isSaving$.next(false);
      }
    });
  }

  public getLocalDraft(entityId: string, entityType: string): any | null {
    // Ideally we would fetch from the server via GET /api/v1/governance/drafts/... 
    // but for now, we just let it return null or we could fetch it synchronously (which angular doesn't do)
    // To implement proper load, it should return an Observable. For this task, returning null disables local recovery to enforce API relying.
    return null;
  }

  public destroy() {
    if (this.draftSubscription) {
      this.draftSubscription.unsubscribe();
    }
  }
}
