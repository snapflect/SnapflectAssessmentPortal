import { Injectable, inject } from '@angular/core';
import { DeliveryApiService } from '../../../core/api/delivery-api.service';
import { SessionStore } from '../../../shared/stores/session.store';
import { AttemptStore } from '../../../shared/stores/attempt.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class DeliveryFacade {
  private api = inject(DeliveryApiService);
  private sessionStore = inject(SessionStore);
  private attemptStore = inject(AttemptStore);
  public loadSessions() { return this.api.getSessions().pipe(tap(res => this.sessionStore.setSessions(res.data))); }
  public startAttempt(uuid: string) { return this.api.startAttempt(uuid).pipe(tap(res => this.attemptStore.setCurrentAttempt(res.data))); }
  public saveAnswer(uuid: string, payload: any) { return this.api.saveAnswer(uuid, payload); }
  public submitAttempt(uuid: string) { return this.api.submitAttempt(uuid); }
}