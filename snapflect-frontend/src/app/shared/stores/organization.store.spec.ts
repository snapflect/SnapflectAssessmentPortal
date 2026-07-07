import { TestBed } from '@angular/core/testing';
import { OrganizationStore } from './organization.store';

describe('OrganizationStore', () => {
  let store: OrganizationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationStore]
    });
    store = TestBed.inject(OrganizationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty organizations and null currentOrg', () => {
    expect(store.organizations()).toEqual([]);
    expect(store.currentOrg()).toBeNull();
  });

  it('should update organizations when setOrganizations is called', () => {
    const mockData = [{ id: 1, name: 'Acme Corp' }];
    store.setOrganizations(mockData);
    expect(store.organizations()).toEqual(mockData);
  });

  it('should update currentOrg when setCurrentOrg is called', () => {
    const mockData = { id: 1, name: 'Acme Corp' };
    store.setCurrentOrg(mockData);
    expect(store.currentOrg()).toEqual(mockData);
  });
});
