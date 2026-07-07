import { TestBed } from '@angular/core/testing';
import { GovernanceFacade } from './governance.facade';
import { GovernanceApiService } from '../../../core/api/governance-api.service';
import { GovernanceStore } from '../../../shared/stores/governance.store';
import { OrganizationStore } from '../../../shared/stores/organization.store';
import { of } from 'rxjs';

describe('GovernanceFacade', () => {
  let facade: GovernanceFacade;
  let apiServiceMock: jasmine.SpyObj<GovernanceApiService>;
  let governanceStoreMock: jasmine.SpyObj<GovernanceStore>;
  let organizationStoreMock: jasmine.SpyObj<OrganizationStore>;

  beforeEach(() => {
    apiServiceMock = jasmine.createSpyObj('GovernanceApiService', [
      'getOrganizations', 'getDepartments', 'getRoles', 'getPermissions', 'getUsers'
    ]);
    governanceStoreMock = jasmine.createSpyObj('GovernanceStore', [
      'setDepartments', 'setRoles', 'setPermissions', 'setUsers'
    ]);
    organizationStoreMock = jasmine.createSpyObj('OrganizationStore', [
      'setOrganizations'
    ]);

    TestBed.configureTestingModule({
      providers: [
        GovernanceFacade,
        { provide: GovernanceApiService, useValue: apiServiceMock },
        { provide: GovernanceStore, useValue: governanceStoreMock },
        { provide: OrganizationStore, useValue: organizationStoreMock }
      ]
    });

    facade = TestBed.inject(GovernanceFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadOrganizations', () => {
    it('should call api getOrganizations and update organization store', () => {
      const mockResponse = { data: [{ id: 1, name: 'Org 1' }] };
      apiServiceMock.getOrganizations.and.returnValue(of(mockResponse as any));

      facade.loadOrganizations().subscribe();

      expect(apiServiceMock.getOrganizations).toHaveBeenCalled();
      expect(organizationStoreMock.setOrganizations).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('loadDepartments', () => {
    it('should call api getDepartments and update governance store', () => {
      const mockResponse = { data: [{ id: 1, name: 'Dept 1' }] };
      apiServiceMock.getDepartments.and.returnValue(of(mockResponse as any));

      facade.loadDepartments().subscribe();

      expect(apiServiceMock.getDepartments).toHaveBeenCalled();
      expect(governanceStoreMock.setDepartments).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('loadRoles', () => {
    it('should call api getRoles and update governance store', () => {
      const mockResponse = { data: [{ id: 1, name: 'Role 1' }] };
      apiServiceMock.getRoles.and.returnValue(of(mockResponse as any));

      facade.loadRoles().subscribe();

      expect(apiServiceMock.getRoles).toHaveBeenCalled();
      expect(governanceStoreMock.setRoles).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('loadPermissions', () => {
    it('should call api getPermissions and update governance store', () => {
      const mockResponse = { data: [{ id: 1, name: 'Perm 1' }] };
      apiServiceMock.getPermissions.and.returnValue(of(mockResponse as any));

      facade.loadPermissions().subscribe();

      expect(apiServiceMock.getPermissions).toHaveBeenCalled();
      expect(governanceStoreMock.setPermissions).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('loadUsers', () => {
    it('should call api getUsers and update governance store', () => {
      const mockResponse = { data: [{ id: 1, name: 'User 1' }] };
      apiServiceMock.getUsers.and.returnValue(of(mockResponse as any));

      facade.loadUsers().subscribe();

      expect(apiServiceMock.getUsers).toHaveBeenCalled();
      expect(governanceStoreMock.setUsers).toHaveBeenCalledWith(mockResponse.data);
    });
  });
});