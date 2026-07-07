import { TestBed } from '@angular/core/testing';
import { ReportingFacade } from './reporting.facade';
import { ReportingApiService } from '../../../core/api/reporting-api.service';
import { ReportingStore } from '../../../shared/stores/reporting.store';
import { of } from 'rxjs';

describe('ReportingFacade', () => {
  let facade: ReportingFacade;
  let apiSpy: jasmine.SpyObj<ReportingApiService>;
  let storeSpy: jasmine.SpyObj<ReportingStore>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ReportingApiService', ['getAssessmentReport', 'exportCsv']);
    storeSpy = jasmine.createSpyObj('ReportingStore', ['setReports']);

    TestBed.configureTestingModule({
      providers: [
        ReportingFacade,
        { provide: ReportingApiService, useValue: apiSpy },
        { provide: ReportingStore, useValue: storeSpy }
      ]
    });

    facade = TestBed.inject(ReportingFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load assessment report and update store', (done) => {
    const mockParams = { id: 1 };
    const mockResponse = { data: [{ id: 1, name: 'Report 1' }] };
    
    apiSpy.getAssessmentReport.and.returnValue(of(mockResponse));

    facade.loadAssessmentReport(mockParams).subscribe(() => {
      expect(apiSpy.getAssessmentReport).toHaveBeenCalledWith(mockParams);
      expect(storeSpy.setReports).toHaveBeenCalledWith(mockResponse.data);
      done();
    });
  });

  it('should export csv via api', (done) => {
    const mockParams = { type: 'users' };
    const mockBlob = new Blob();
    
    apiSpy.exportCsv.and.returnValue(of(mockBlob as any));

    facade.exportCsv(mockParams).subscribe((res) => {
      expect(apiSpy.exportCsv).toHaveBeenCalledWith(mockParams);
      expect(res).toBe(mockBlob);
      done();
    });
  });
});