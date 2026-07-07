import { TestBed } from '@angular/core/testing';
import { ResultsFacade } from './results.facade';
import { ResultsApiService } from '../../../core/api/results-api.service';
import { ResultsStore } from '../../../shared/stores/results.store';
import { ResultVersionStore } from '../../../shared/stores/result-version.store';
import { PublicationStore } from '../../../shared/stores/publication.store';
import { ManualReviewStore } from '../../../shared/stores/manual-review.store';
import { of } from 'rxjs';

describe('ResultsFacade', () => {
  let facade: ResultsFacade;
  let mockApiService: jasmine.SpyObj<ResultsApiService>;
  let mockResultsStore: jasmine.SpyObj<ResultsStore>;
  let mockVersionStore: jasmine.SpyObj<ResultVersionStore>;
  let mockPublicationStore: jasmine.SpyObj<PublicationStore>;
  let mockManualReviewStore: jasmine.SpyObj<ManualReviewStore>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ResultsApiService', [
      'getResults',
      'getResult',
      'getVersions',
      'getPublication',
      'getManualReviews'
    ]);
    mockResultsStore = jasmine.createSpyObj('ResultsStore', ['setResults', 'setCurrentResult']);
    mockVersionStore = jasmine.createSpyObj('ResultVersionStore', ['setVersions']);
    mockPublicationStore = jasmine.createSpyObj('PublicationStore', ['setPublication']);
    mockManualReviewStore = jasmine.createSpyObj('ManualReviewStore', ['setReviews']);

    TestBed.configureTestingModule({
      providers: [
        ResultsFacade,
        { provide: ResultsApiService, useValue: mockApiService },
        { provide: ResultsStore, useValue: mockResultsStore },
        { provide: ResultVersionStore, useValue: mockVersionStore },
        { provide: PublicationStore, useValue: mockPublicationStore },
        { provide: ManualReviewStore, useValue: mockManualReviewStore },
      ]
    });

    facade = TestBed.inject(ResultsFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load results and update store', (done) => {
    const mockData = [{ id: '1' }];
    mockApiService.getResults.and.returnValue(of({ data: mockData } as any));

    facade.loadResults().subscribe(() => {
      expect(mockApiService.getResults).toHaveBeenCalled();
      expect(mockResultsStore.setResults).toHaveBeenCalledWith(mockData as any);
      done();
    });
  });

  it('should load result and update store', (done) => {
    const mockData = { id: '1' };
    mockApiService.getResult.and.returnValue(of({ data: mockData } as any));

    facade.loadResult('1').subscribe(() => {
      expect(mockApiService.getResult).toHaveBeenCalledWith('1');
      expect(mockResultsStore.setCurrentResult).toHaveBeenCalledWith(mockData as any);
      done();
    });
  });

  it('should load versions and update store', (done) => {
    const mockData = [{ id: 'v1' }];
    mockApiService.getVersions.and.returnValue(of({ data: mockData } as any));

    facade.loadVersions('1').subscribe(() => {
      expect(mockApiService.getVersions).toHaveBeenCalledWith('1');
      expect(mockVersionStore.setVersions).toHaveBeenCalledWith(mockData as any);
      done();
    });
  });

  it('should load publication and update store', (done) => {
    const mockData = { id: 'p1' };
    mockApiService.getPublication.and.returnValue(of({ data: mockData } as any));

    facade.loadPublication('1').subscribe(() => {
      expect(mockApiService.getPublication).toHaveBeenCalledWith('1');
      expect(mockPublicationStore.setPublication).toHaveBeenCalledWith(mockData as any);
      done();
    });
  });

  it('should load manual reviews and update store', (done) => {
    const mockData = [{ id: 'r1' }];
    mockApiService.getManualReviews.and.returnValue(of({ data: mockData } as any));

    facade.loadManualReviews('1').subscribe(() => {
      expect(mockApiService.getManualReviews).toHaveBeenCalledWith('1');
      expect(mockManualReviewStore.setReviews).toHaveBeenCalledWith(mockData as any);
      done();
    });
  });
});