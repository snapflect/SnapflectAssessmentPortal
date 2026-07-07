import { TestBed } from '@angular/core/testing';
import { PublicationStore } from './publication.store';

describe('PublicationStore', () => {
  let store: PublicationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PublicationStore]
    });
    store = TestBed.inject(PublicationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null publication', () => {
    expect(store.publication()).toBeNull();
  });

  it('should update publication when setPublication is called', () => {
    const mockData = { id: 1, title: 'Release 1' };
    store.setPublication(mockData);
    expect(store.publication()).toEqual(mockData);
  });
});
