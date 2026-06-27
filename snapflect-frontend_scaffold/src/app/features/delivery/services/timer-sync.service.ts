import { Injectable, inject } from '@angular/core';
import { ExecutionApiService } from '../../../core/api/execution-api.service';
import { DeliveryStore } from '../store/delivery.store';

@Injectable({
  providedIn: 'root'
})
export class TimerSyncService {
  private api = inject(ExecutionApiService);
  private store = inject(DeliveryStore);
  private intervalId: any;

  public startPolling(attemptUuid: string, intervalMs: number = 30000) {
    this.stopPolling();
    this.sync(attemptUuid);
    this.intervalId = setInterval(() => {
      this.sync(attemptUuid);
    }, intervalMs);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private sync(attemptUuid: string) {
    this.api.getTimer(attemptUuid).subscribe({
      next: (res) => this.store.updateTimer(res),
      error: (err) => {
        console.error('Timer sync failed', err);
        if (err.status === 401 || err.status === 403) {
           this.stopPolling();
        }
      }
    });
  }
}
