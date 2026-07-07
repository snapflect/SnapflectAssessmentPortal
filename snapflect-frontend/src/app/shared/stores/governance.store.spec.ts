import { TestBed } from '@angular/core/testing';
import { GovernanceStore } from './governance.store';

describe('GovernanceStore', () => {
  let store: GovernanceStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GovernanceStore]
    });
    store = TestBed.inject(GovernanceStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty arrays for all state', () => {
    expect(store.departments()).toEqual([]);
    expect(store.roles()).toEqual([]);
    expect(store.permissions()).toEqual([]);
    expect(store.users()).toEqual([]);
  });

  it('should update departments when setDepartments is called', () => {
    const mockData = [{ id: 'd1', name: 'HR' }];
    store.setDepartments(mockData);
    expect(store.departments()).toEqual(mockData);
  });

  it('should update roles when setRoles is called', () => {
    const mockData = [{ id: 'r1', name: 'Admin' }];
    store.setRoles(mockData);
    expect(store.roles()).toEqual(mockData);
  });

  it('should update permissions when setPermissions is called', () => {
    const mockData = [{ id: 'p1', action: 'read' }];
    store.setPermissions(mockData);
    expect(store.permissions()).toEqual(mockData);
  });

  it('should update users when setUsers is called', () => {
    const mockData = [{ id: 'u1', name: 'John Doe' }];
    store.setUsers(mockData);
    expect(store.users()).toEqual(mockData);
  });
});