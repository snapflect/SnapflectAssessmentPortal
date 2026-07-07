import { TestBed } from '@angular/core/testing';
import { ReportingStore } from './reporting.store';

describe('ReportingStore', () => {
  let store: ReportingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportingStore]
    });
    store = TestBed.inject(ReportingStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty reports', () => {
    expect(store.reports()).toEqual([]);
  });

  it('should update reports when setReports is called', () => {
    const mockData = [{ id: 1, title: 'Report 1' }];
    store.setReports(mockData);
    expect(store.reports()).toEqual(mockData);
  });
});