import { TestBed } from '@angular/core/testing';
import { QuestionBankStore } from './question-bank.store';

describe('QuestionBankStore', () => {
  let store: QuestionBankStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionBankStore]
    });
    store = TestBed.inject(QuestionBankStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty questionBanks', () => {
    expect(store.questionBanks()).toEqual([]);
  });

  it('should update questionBanks when setQuestionBanks is called', () => {
    const mockData = [{ id: 1, name: 'Math Bank' }];
    store.setQuestionBanks(mockData);
    expect(store.questionBanks()).toEqual(mockData);
  });
});
