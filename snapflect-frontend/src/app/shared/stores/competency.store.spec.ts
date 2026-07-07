import { TestBed } from '@angular/core/testing';
import { CompetencyStore } from './competency.store';

describe('CompetencyStore', () => {
  let store: CompetencyStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompetencyStore]
    });
    store = TestBed.inject(CompetencyStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty competencies', () => {
    expect(store.competencies()).toEqual([]);
  });

  it('should update competencies when setCompetencies is called', () => {
    const mockData = [{ id: 1, name: 'Angular' }, { id: 2, name: 'React' }];
    store.setCompetencies(mockData);
    expect(store.competencies()).toEqual(mockData);
  });
});
