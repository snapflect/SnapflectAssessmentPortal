import { Injectable, inject } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, catchError, filter } from 'rxjs/operators';
import { ExecutionApiService } from '../../../core/api/execution-api.service';
import { DeliveryStore } from '../store/delivery.store';
import { AutoSaveRequestDto } from '../../../core/models/execution.dto';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService {
  private api = inject(ExecutionApiService);
  private store = inject(DeliveryStore);
  private saveSubject = new Subject<{ attemptUuid: string, payload: AutoSaveRequestDto }>();

  constructor() {
    this.saveSubject.pipe(
      debounceTime(1500),
      switchMap(req => this.api.autoSave(req.attemptUuid, req.payload).pipe(
        catchError(err => {
          console.error('AutoSave failed', err);
          return of(null);
        })
      )),
      filter(res => res !== null)
    ).subscribe(res => {
      if (res) {
        this.store.recordSaveSuccess(res);
      }
    });
  }

  public triggerSave(attemptUuid: string, questionUuid: string, clientDraftVersion: string, answerPayload: any) {
    this.saveSubject.next({
      attemptUuid,
      payload: { questionUuid, clientDraftVersion, answerPayload }
    });
  }
}
