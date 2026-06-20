import { Injectable, inject } from '@angular/core';
import { ReportingApiService } from '../../../core/api/reporting-api.service';
import { ReportingStore } from '../../../shared/stores/reporting.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class ReportingFacade {
  private api = inject(ReportingApiService);
  private store = inject(ReportingStore);
  public loadAssessmentReport(params: any) { return this.api.getAssessmentReport(params).pipe(tap(res => this.store.setReports(res.data))); }
  public exportCsv(params: any) { return this.api.exportCsv(params); }
}