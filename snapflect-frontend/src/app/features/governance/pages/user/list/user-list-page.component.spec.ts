import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserListPageComponent } from './user-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { UserStore } from '../../../../../shared/stores/user.store';
import { environment } from '../../../../../../environments/environment';

describe('UserListPageComponent', () => {
  let component: UserListPageComponent;
  let fixture: ComponentFixture<UserListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;
  let mockUserStore: any;

  const mockUsers = [
    {
      id: 1,
      uuid: 'user-uuid-1',
      attributes: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        status: 'ACTIVE',
        organization_id: 1
      },
      relationships: {
        roles: [{ uuid: 'role-uuid-1', attributes: { role_name: 'Admin' } }]
      }
    }
  ];

  const mockOrgs = [
    { id: 1, attributes: { organization_name: 'Org 1' } }
  ];

  const mockRoles = [
    { uuid: 'role-uuid-1', attributes: { role_name: 'Admin' } },
    { uuid: 'role-uuid-2', attributes: { role_name: 'User' } }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmService', ['confirm']);
    mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
    mockUserStore = jasmine.createSpyObj('UserStore', ['hasAnyRole']);
    mockUserStore.hasAnyRole.and.returnValue(true); // By default, act as PLATFORM_ADMIN

    await TestBed.configureTestingModule({
      imports: [
        UserListPageComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmService, useValue: mockConfirmService },
        { provide: UserStore, useValue: mockUserStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    // Initial fetches
    const usersReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
    usersReq.flush({ data: mockUsers });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush({ data: mockOrgs });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch users and orgs on init', () => {
    expect(component).toBeTruthy();
    expect(component.users.length).toBe(1);
    expect(component.organizations.length).toBe(1);
    expect(component.isPlatformAdmin).toBeTrue();
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchUsers();
    component.fetchOrganizations();

    const usersReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
    usersReq.flush('Error', { status: 500, statusText: 'Server Error' });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.loading).toBeFalse();
  });

  describe('Role Fetching', () => {
    it('should fetch all roles if not cached', fakeAsync(() => {
      component.allRoles = [];
      component.fetchAllRoles();
      const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
      rolesReq.flush({ data: mockRoles });
      tick();
      expect(component.allRoles.length).toBe(2);
    }));

    it('should return cached roles without HTTP request', fakeAsync(() => {
      component.allRoles = mockRoles;
      component.fetchAllRoles();
      httpMock.expectNone(`${environment.apiUrl}/security/roles`);
      tick();
    }));

    it('should handle role fetch errors', fakeAsync(() => {
      component.allRoles = [];
      component.fetchAllRoles();
      const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
      rolesReq.flush('Error', { status: 500, statusText: 'Server Error' });
      tick();
      expect(component.allRoles.length).toBe(0);
    }));
  });

  describe('Form Handling', () => {
    it('should open create form and reset state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.userForm.get('password')?.validator).toBeTruthy();

      const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
      rolesReq.flush({ data: mockRoles });
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockUsers[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('user-uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.userForm.get('first_name')?.value).toBe('John');
      expect(component.userForm.get('email')?.disabled).toBeTrue();
      expect(component.userForm.get('organization_id')?.disabled).toBeTrue();
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
      rolesReq.flush({ data: mockRoles });

      spyOn(component.userForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.userForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });

        component.userForm.patchValue({
          organization_id: 1,
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          password: 'supersecretpassword',
          initial_role_uuid: null
        });
      });

      it('should successfully submit new user without role', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
        expect(req.request.method).toBe('POST');
        req.flush({ data: { uuid: 'new-uuid' } });

        expect(mockToastService.success).toHaveBeenCalledWith('User Invited', 'The new user has been provisioned and invited.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
        fetchReq.flush({ data: mockUsers });
      });

      it('should successfully submit new user with role and assign it', () => {
        component.userForm.patchValue({ initial_role_uuid: 'role-uuid-1' });
        component.submitForm();
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
        req.flush({ data: { uuid: 'new-uuid' } });

        const roleReq = httpMock.expectOne(`${environment.apiUrl}/security/users/new-uuid/roles/role-uuid-1`);
        expect(roleReq.request.method).toBe('POST');
        roleReq.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('User Invited', 'The new user has been provisioned and the selected role assigned.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
        fetchReq.flush({ data: mockUsers });
      });

      it('should handle role assignment failure gracefully during user creation', () => {
        component.userForm.patchValue({ initial_role_uuid: 'role-uuid-1' });
        component.submitForm();
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
        req.flush({ data: { uuid: 'new-uuid' } });

        const roleReq = httpMock.expectOne(`${environment.apiUrl}/security/users/new-uuid/roles/role-uuid-1`);
        roleReq.flush('Error', { status: 500, statusText: 'Server Error' });

        expect(mockToastService.success).toHaveBeenCalledWith('User Invited', 'User created successfully. Role assignment failed \u2014 use Manage Roles to assign manually.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
        fetchReq.flush({ data: mockUsers });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to provision user.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockUsers[0] as any);
        component.userForm.patchValue({
          first_name: 'Updated Name',
          password: '' // empty password during edit
        });
      });

      it('should successfully submit edited user', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1`);
        expect(req.request.method).toBe('PUT');
        // ensure password was deleted from payload
        expect(req.request.body.password).toBeUndefined();
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('User Updated', 'The user profile has been successfully updated.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
        fetchReq.flush({ data: mockUsers });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update user.');
      });
    });

    describe('Close Form', () => {
      it('should close form immediately if pristine', fakeAsync(() => {
        component.openCreateForm();
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });

        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should close form immediately if force=true even if dirty', fakeAsync(() => {
        component.openCreateForm();
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });

        component.userForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });

        component.userForm.markAsDirty();
        component.closeForm();
        tick();
        expect(mockConfirmService.confirm).toHaveBeenCalled();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });

        component.userForm.markAsDirty();
        component.closeForm();
        tick();
        expect(mockConfirmService.confirm).toHaveBeenCalled();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Manage Roles Modal', () => {
    it('should open modal and fetch roles', fakeAsync(() => {
      component.openRoleModal(mockUsers[0] as any);
      const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
      rolesReq.flush({ data: mockRoles });
      tick();
      expect(component.isRoleModalOpen).toBeTrue();
      expect(component.activeUserForRole).toBeTruthy();
      expect(component.activeUserRoles.length).toBe(1);
      expect(component.unassignedRoles.length).toBe(1);
    }));

    it('should close modal and fetch users', () => {
      component.isRoleModalOpen = true;
      component.closeRoleModal();
      expect(component.isRoleModalOpen).toBeFalse();
      expect(component.activeUserForRole).toBeNull();
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/users?include=roles`);
      fetchReq.flush({ data: mockUsers });
    });

    describe('refreshModalRoleLists edge cases', () => {
      it('should do nothing if activeUserForRole is null', () => {
        component.activeUserForRole = null;
        component.refreshModalRoleLists();
        expect(component.activeUserRoles).toEqual([]);
      });
    });

    describe('Assign Role', () => {
      beforeEach(fakeAsync(() => {
        component.openRoleModal(mockUsers[0] as any);
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });
        tick();
      }));

      it('should assign role successfully', () => {
        const roleToAssign = component.unassignedRoles[0];
        component.assignRole(roleToAssign);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-2`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Role Assigned', 'User has been assigned.');
        expect(component.activeUserRoles.length).toBe(2);
      });

      it('should handle assign role error', () => {
        const roleToAssign = component.unassignedRoles[0];
        component.assignRole(roleToAssign);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-2`);
        req.flush({ message: 'Assign failed' }, { status: 400, statusText: 'Bad Request' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Assign failed');
      });
      
      it('should handle assign role error with fallback message', () => {
        const roleToAssign = component.unassignedRoles[0];
        component.assignRole(roleToAssign);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-2`);
        req.flush(null, { status: 500, statusText: 'Server Error' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to assign role.');
      });

      it('should do nothing if activeUserForRole is null', () => {
        component.activeUserForRole = null;
        component.assignRole(mockRoles[0]);
        httpMock.expectNone(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-1`);
      });
    });

    describe('Revoke Role', () => {
      beforeEach(fakeAsync(() => {
        component.openRoleModal(mockUsers[0] as any);
        const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        rolesReq.flush({ data: mockRoles });
        tick();
      }));

      it('should revoke role successfully', () => {
        const roleToRevoke = component.activeUserRoles[0];
        component.revokeRole(roleToRevoke);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Role Revoked', 'Admin has been removed.');
        expect(component.activeUserRoles.length).toBe(0);
      });

      it('should handle revoke role error', () => {
        const roleToRevoke = component.activeUserRoles[0];
        component.revokeRole(roleToRevoke);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-1`);
        req.flush({ message: 'Revoke failed' }, { status: 400, statusText: 'Bad Request' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Revoke failed');
      });
      
      it('should handle revoke role error with fallback message', () => {
        const roleToRevoke = component.activeUserRoles[0];
        component.revokeRole(roleToRevoke);
        
        const req = httpMock.expectOne(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to revoke role.');
      });

      it('should do nothing if activeUserForRole is null', () => {
        component.activeUserForRole = null;
        component.revokeRole(mockRoles[0]);
        httpMock.expectNone(`${environment.apiUrl}/security/users/user-uuid-1/roles/role-uuid-1`);
      });
    });
  });
});
