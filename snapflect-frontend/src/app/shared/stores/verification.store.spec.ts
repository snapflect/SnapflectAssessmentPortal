import { TestBed } from '@angular/core/testing';
import { VerificationStore } from './verification.store';

describe('VerificationStore', () => {
  let store: VerificationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VerificationStore]
    });
    store = TestBed.inject(VerificationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with null verificationResult', () => {
    expect(store.verificationResult()).toBeNull();
  });

  it('should update verificationResult when setVerificationResult is called', () => {
    const mockData = { isValid: true, token: 'abc' };
    store.setVerificationResult(mockData);
    expect(store.verificationResult()).toEqual(mockData);
  });
});