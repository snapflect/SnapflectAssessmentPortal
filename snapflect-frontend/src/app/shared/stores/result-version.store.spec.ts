import { TestBed } from '@angular/core/testing';
import { ResultVersionStore } from './result-version.store';

describe('ResultVersionStore', () => {
  let store: ResultVersionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultVersionStore]
    });
    store = TestBed.inject(ResultVersionStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty versions', () => {
    expect(store.versions()).toEqual([]);
  });

  it('should update versions when setVersions is called', () => {
    const mockData = [{ version: '1.0' }, { version: '2.0' }];
    store.setVersions(mockData);
    expect(store.versions()).toEqual(mockData);
  });
});
