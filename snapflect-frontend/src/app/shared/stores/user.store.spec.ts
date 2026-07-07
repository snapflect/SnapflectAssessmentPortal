import { TestBed } from '@angular/core/testing';
import { UserStore, UserProfile } from './user.store';

describe('UserStore', () => {
  let store: UserStore;

  const mockProfile: UserProfile = {
    id: 1,
    email: 'test@example.com',
    roles: ['ADMIN', 'AUTHOR'],
    permissions: ['CREATE_ASSESSMENT', 'VIEW_REPORTS'],
    tenantId: 'tenant-123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserStore]
    });
    sessionStorage.clear();
    store = TestBed.inject(UserStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created and initialize with null profile', () => {
    expect(store).toBeTruthy();
    expect(store.profile()).toBeNull();
    expect(store.tenantId()).toBeNull();
  });

  it('should set profile and update session storage', () => {
    store.setProfile(mockProfile);
    
    expect(store.profile()).toEqual(mockProfile);
    expect(store.tenantId()).toEqual('tenant-123');
    
    const stored = JSON.parse(sessionStorage.getItem('user_profile')!);
    expect(stored.email).toEqual('test@example.com');
  });

  it('should clear profile and remove from session storage', () => {
    store.setProfile(mockProfile);
    store.setProfile(null);
    
    expect(store.profile()).toBeNull();
    expect(sessionStorage.getItem('user_profile')).toBeNull();
  });

  it('should check if user has any role', () => {
    store.setProfile(mockProfile);
    
    expect(store.hasAnyRole(['ADMIN'])).toBeTrue();
    expect(store.hasAnyRole(['AUTHOR', 'CANDIDATE'])).toBeTrue();
    expect(store.hasAnyRole(['CANDIDATE'])).toBeFalse();
    expect(store.hasAnyRole([])).toBeFalse();
  });

  it('should check if user has any role when profile is null', () => {
    expect(store.hasAnyRole(['ADMIN'])).toBeFalse();
  });

  it('should check if user has any permission', () => {
    store.setProfile(mockProfile);
    
    expect(store.hasAnyPermission(['CREATE_ASSESSMENT'])).toBeTrue();
    expect(store.hasAnyPermission(['DELETE_USER', 'VIEW_REPORTS'])).toBeTrue();
    expect(store.hasAnyPermission(['DELETE_USER'])).toBeFalse();
  });

  it('should check if user has any permission when profile is null', () => {
    expect(store.hasAnyPermission(['CREATE_ASSESSMENT'])).toBeFalse();
  });

  it('should return default route based on authentication', () => {
    expect(store.getDefaultRoute()).toEqual('/auth/login');
    
    store.setProfile(mockProfile);
    expect(store.getDefaultRoute()).toEqual('/dashboard');

    // Test pure CONTENT_CREATOR
    store.setProfile({ ...mockProfile, roles: ['CONTENT_CREATOR'] });
    expect(store.getDefaultRoute()).toEqual('/authoring/dashboard');

    // Test pure REVIEWER
    store.setProfile({ ...mockProfile, roles: ['REVIEWER'] });
    expect(store.getDefaultRoute()).toEqual('/results/reviewer-dashboard');

    // Test pure ASSESSMENT_MANAGER
    store.setProfile({ ...mockProfile, roles: ['ASSESSMENT_MANAGER'] });
    expect(store.getDefaultRoute()).toEqual('/delivery/sessions');
  });
});