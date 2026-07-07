import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionStore]
    });
    store = TestBed.inject(SessionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty sessions', () => {
    expect(store.sessions()).toEqual([]);
  });

  it('should update sessions when setSessions is called', () => {
    const mockData = [{ id: 1, active: true }];
    store.setSessions(mockData);
    expect(store.sessions()).toEqual(mockData);
  });
});
