import { TestBed } from '@angular/core/testing';
import { DeliveryQuestionStore } from './delivery-question.store';

describe('DeliveryQuestionStore', () => {
  let store: DeliveryQuestionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeliveryQuestionStore]
    });
    store = TestBed.inject(DeliveryQuestionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty questions and zero currentIndex', () => {
    expect(store.questions()).toEqual([]);
    expect(store.currentIndex()).toBe(0);
  });

  it('should update questions when setQuestions is called', () => {
    const mockData = [{ id: 'q1', text: 'What is 2+2?' }];
    store.setQuestions(mockData);
    expect(store.questions()).toEqual(mockData);
  });

  it('should update currentIndex when setCurrentIndex is called', () => {
    store.setCurrentIndex(5);
    expect(store.currentIndex()).toBe(5);
  });
});
