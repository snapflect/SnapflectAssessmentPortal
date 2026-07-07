import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore]
    });
    // Clear session storage before each test
    sessionStorage.clear();
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null token if sessionStorage is empty', () => {
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
  });

  it('should initialize with token from sessionStorage if present', () => {
    sessionStorage.setItem('auth_token', 'initial-token');
    
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AuthStore]
    });
    
    // Re-inject to trigger initialization with the new session storage
    const newStore = TestBed.inject(AuthStore);
    
    expect(newStore.token()).toEqual('initial-token');
    expect(newStore.isAuthenticated()).toBeTrue();
  });

  it('should set token in signal and sessionStorage', () => {
    store.setToken('my-new-token');
    
    expect(store.token()).toEqual('my-new-token');
    expect(store.isAuthenticated()).toBeTrue();
    expect(sessionStorage.getItem('auth_token')).toEqual('my-new-token');
  });

  it('should clear token from signal and sessionStorage', () => {
    store.setToken('temp-token');
    store.clearToken();
    
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });
});