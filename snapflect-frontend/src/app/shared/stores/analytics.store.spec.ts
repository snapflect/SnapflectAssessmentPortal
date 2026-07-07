import { TestBed } from '@angular/core/testing';
import { AnalyticsStore } from './analytics.store';

describe('AnalyticsStore', () => {
  let store: AnalyticsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsStore]
    });
    store = TestBed.inject(AnalyticsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null metrics', () => {
    expect(store.metrics()).toBeNull();
  });

  it('should update metrics when setMetrics is called', () => {
    const mockData = { totalUsers: 100, activeUsers: 50 };
    store.setMetrics(mockData);
    expect(store.metrics()).toEqual(mockData);
  });
});