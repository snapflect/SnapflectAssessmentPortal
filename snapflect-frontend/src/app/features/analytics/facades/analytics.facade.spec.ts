import { TestBed } from '@angular/core/testing';
import { AnalyticsFacade } from './analytics.facade';
import { AnalyticsApiService } from '../../../core/api/analytics-api.service';
import { AnalyticsStore } from '../../../shared/stores/analytics.store';
import { of } from 'rxjs';

describe('AnalyticsFacade', () => {
  let facade: AnalyticsFacade;
  let apiServiceSpy: jasmine.SpyObj<AnalyticsApiService>;
  let storeSpy: jasmine.SpyObj<AnalyticsStore>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('AnalyticsApiService', ['getAssessmentTrends']);
    const storeSpyObj = jasmine.createSpyObj('AnalyticsStore', ['setMetrics']);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsFacade,
        { provide: AnalyticsApiService, useValue: apiSpy },
        { provide: AnalyticsStore, useValue: storeSpyObj }
      ]
    });

    facade = TestBed.inject(AnalyticsFacade);
    apiServiceSpy = TestBed.inject(AnalyticsApiService) as jasmine.SpyObj<AnalyticsApiService>;
    storeSpy = TestBed.inject(AnalyticsStore) as jasmine.SpyObj<AnalyticsStore>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should call getAssessmentTrends on api and setMetrics on store', (done) => {
    const mockResponse = { data: { trend: 'up' } };
    apiServiceSpy.getAssessmentTrends.and.returnValue(of(mockResponse));

    facade.loadAssessmentTrends({ time: '7d' }).subscribe(() => {
      expect(apiServiceSpy.getAssessmentTrends).toHaveBeenCalledWith({ time: '7d' });
      expect(storeSpy.setMetrics).toHaveBeenCalledWith(mockResponse.data);
      done();
    });
  });
});