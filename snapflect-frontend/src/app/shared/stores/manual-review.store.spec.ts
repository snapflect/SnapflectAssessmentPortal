import { TestBed } from '@angular/core/testing';
import { ManualReviewStore } from './manual-review.store';

describe('ManualReviewStore', () => {
  let store: ManualReviewStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManualReviewStore]
    });
    store = TestBed.inject(ManualReviewStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty reviews', () => {
    expect(store.reviews()).toEqual([]);
  });

  it('should update reviews when setReviews is called', () => {
    const mockData = [{ id: 1, reviewer: 'Alice' }];
    store.setReviews(mockData);
    expect(store.reviews()).toEqual(mockData);
  });
});
