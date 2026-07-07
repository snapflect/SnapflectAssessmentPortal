import { TestBed } from '@angular/core/testing';
import { AttemptStore } from './attempt.store';

describe('AttemptStore', () => {
  let store: AttemptStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttemptStore]
    });
    store = TestBed.inject(AttemptStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null currentAttempt and empty answers', () => {
    expect(store.currentAttempt()).toBeNull();
    expect(store.answers()).toEqual({});
  });

  it('should update currentAttempt when setCurrentAttempt is called', () => {
    const mockAttempt = { attemptId: '123', status: 'IN_PROGRESS' };
    store.setCurrentAttempt(mockAttempt);
    expect(store.currentAttempt()).toEqual(mockAttempt);
  });

  it('should add or update answers when setAnswer is called', () => {
    store.setAnswer('q1', 'optionA');
    expect(store.answers()).toEqual({ q1: 'optionA' });

    store.setAnswer('q2', 'optionB');
    expect(store.answers()).toEqual({ q1: 'optionA', q2: 'optionB' });

    store.setAnswer('q1', 'optionC');
    expect(store.answers()).toEqual({ q1: 'optionC', q2: 'optionB' });
  });
});