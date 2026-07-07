import { TestBed } from '@angular/core/testing';
import { QuestionStore } from './question.store';

describe('QuestionStore', () => {
  let store: QuestionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionStore]
    });
    store = TestBed.inject(QuestionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty questions', () => {
    expect(store.questions()).toEqual([]);
  });

  it('should update questions when setQuestions is called', () => {
    const mockData = [{ id: 1, text: 'Q1' }];
    store.setQuestions(mockData);
    expect(store.questions()).toEqual(mockData);
  });
});
