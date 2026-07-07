import { TestBed } from '@angular/core/testing';
import { DeliveryStore } from './delivery.store';

describe('DeliveryStore', () => {
  let store: DeliveryStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeliveryStore]
    });
    store = TestBed.inject(DeliveryStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null state', () => {
    expect(store.state()).toBeNull();
  });

  it('should update state when setState is called', () => {
    const mockState = { isStarted: true, timeLeft: 300 };
    store.setState(mockState);
    expect(store.state()).toEqual(mockState);
  });
});