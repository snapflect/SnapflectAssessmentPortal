import { TestBed } from '@angular/core/testing';
import { NavigationStore } from './navigation.store';

describe('NavigationStore', () => {
  let store: NavigationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavigationStore]
    });
    store = TestBed.inject(NavigationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(store.isLoading()).toBeFalse();
    expect(store.loadingMessage()).toBe('Loading...');
    expect(store.currentPath()).toBe('');
  });

  it('should update loading state and message when setLoading is called', () => {
    store.setLoading(true, 'Please wait...');
    expect(store.isLoading()).toBeTrue();
    expect(store.loadingMessage()).toBe('Please wait...');
  });

  it('should update loading state with default message when setLoading is called without message', () => {
    store.setLoading(true);
    expect(store.isLoading()).toBeTrue();
    expect(store.loadingMessage()).toBe('Loading...');
  });

  it('should update current path when setPath is called', () => {
    store.setPath('/home');
    expect(store.currentPath()).toBe('/home');
  });
});