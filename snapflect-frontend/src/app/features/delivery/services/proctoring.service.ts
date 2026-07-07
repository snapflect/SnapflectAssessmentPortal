import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, shareReplay, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ProctoringSession {
  session_uuid: string;
  attempt_uuid: string | null;
  candidateName: string;
  email: string;
  assessmentName: string;
  timeElapsed: string;
  progress: number;
  cameraOn: boolean;
  micOn: boolean;
  flagged: boolean;
  status: string;
}

interface LiveSessionsResponse {
  success: boolean;
  message: string;
  data: ProctoringSession[];
}

@Injectable({
  providedIn: 'root'
})
export class ProctoringService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/delivery/proctoring`;

  // Expose a polling observable that refreshes every 5 seconds
  public liveSessions$: Observable<LiveSessionsResponse> = timer(0, 5000).pipe(
    switchMap(() => this.http.get<LiveSessionsResponse>(`${this.apiUrl}/live`)),
    retry(3), // Retry on failure before throwing error
    shareReplay(1) // Share the latest result with any new subscribers immediately
  );
}
