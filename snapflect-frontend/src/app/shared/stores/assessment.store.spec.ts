import { TestBed } from '@angular/core/testing';
import { AssessmentStore } from './assessment.store';

describe('AssessmentStore', () => {
  let store: AssessmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssessmentStore]
    });
    store = TestBed.inject(AssessmentStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty assessments', () => {
    expect(store.assessments()).toEqual([]);
  });

  it('should update assessments when setAssessments is called', () => {
    const mockData = [{ id: 1, name: 'Math Test' }, { id: 2, name: 'Science Test' }];
    store.setAssessments(mockData);
    expect(store.assessments()).toEqual(mockData);
  });
});