import { TestBed } from '@angular/core/testing';
import { BlueprintStore } from './blueprint.store';

describe('BlueprintStore', () => {
  let store: BlueprintStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlueprintStore]
    });
    store = TestBed.inject(BlueprintStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty blueprints', () => {
    expect(store.blueprints()).toEqual([]);
  });

  it('should update blueprints when setBlueprints is called', () => {
    const mockData = [{ id: 1, title: 'Blueprint A' }, { id: 2, title: 'Blueprint B' }];
    store.setBlueprints(mockData);
    expect(store.blueprints()).toEqual(mockData);
  });
});