import { TestBed } from '@angular/core/testing';
import { ResultsStore } from './results.store';

describe('ResultsStore', () => {
  let store: ResultsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultsStore]
    });
    store = TestBed.inject(ResultsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty results and null currentResult', () => {
    expect(store.results()).toEqual([]);
    expect(store.currentResult()).toBeNull();
  });

  it('should update results when setResults is called', () => {
    const mockData = [{ id: 1, score: 90 }];
    store.setResults(mockData);
    expect(store.results()).toEqual(mockData);
  });

  it('should update currentResult when setCurrentResult is called', () => {
    const mockData = { id: 1, score: 90 };
    store.setCurrentResult(mockData);
    expect(store.currentResult()).toEqual(mockData);
  });
});