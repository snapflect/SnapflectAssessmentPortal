import { TestBed } from '@angular/core/testing';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  let store: DashboardStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStore]
    });
    store = TestBed.inject(DashboardStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null kpis', () => {
    expect(store.kpis()).toBeNull();
  });

  it('should update kpis when setKpis is called', () => {
    const mockData = { totalSales: 1000, revenue: 50000 };
    store.setKpis(mockData);
    expect(store.kpis()).toEqual(mockData);
  });
});
