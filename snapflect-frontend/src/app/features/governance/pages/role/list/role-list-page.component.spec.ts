import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RoleListPageComponent } from './role-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('RoleListPageComponent', () => {
  let component: RoleListPageComponent;
  let fixture: ComponentFixture<RoleListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;

  const mockRoles = [
    {
      id: 1,
      uuid: 'role-uuid-1',
      attributes: {
        organization_id: null,
        role_code: 'SYS_ADMIN',
        role_name: 'System Admin',
        description: 'Global administrator',
        is_system_role: true,
        status: 'ACTIVE'
      },
      relationships: {
        permissions: [
          { uuid: 'perm-uuid-1', attributes: { permission_code: 'System.Users.Manage' } }
        ]
      }
    }
  ];

  const mockPermissions = [
    { uuid: 'perm-uuid-1', attributes: { permission_code: 'System.Users.Manage', permission_name: 'Manage Users', module: 'System' } },
    { uuid: 'perm-uuid-2', attributes: { permission_code: 'System.Roles.View', permission_name: 'View Roles', module: 'System' } },
    { uuid: 'perm-uuid-3', attributes: { permission_code: 'Assessment.QuestionBanks.Manage', permission_name: 'Manage Question Banks', module: 'Assessment' } }
  ];

  const mockOrgs = [
    { id: 1, attributes: { organization_name: 'Org 1' } }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmService', ['confirm']);
    mockConfirmService.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        RoleListPageComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: ConfirmService, useValue: mockConfirmService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
    rolesReq.flush({ data: mockRoles });

    const permsReq = httpMock.expectOne(`${environment.apiUrl}/security/permissions?per_page=500`);
    permsReq.flush({ data: mockPermissions });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush({ data: mockOrgs });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(component.roles.length).toBe(1);
    expect(component.allPermissions.length).toBe(3);
    expect(component.organizations.length).toBe(1);
    expect(Object.keys(component.groupedPermissions).length).toBe(2);
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchRoles();
    component.fetchAllPermissions();
    component.fetchOrganizations();

    const rolesReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
    rolesReq.flush('Error', { status: 500, statusText: 'Server Error' });

    const permsReq = httpMock.expectOne(`${environment.apiUrl}/security/permissions?per_page=500`);
    permsReq.flush('Error', { status: 500, statusText: 'Server Error' });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.loading).toBeFalse();
  });

  describe('Form Handling', () => {
    it('should open create form and reset state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockRoles[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('role-uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.roleForm.get('role_code')?.disabled).toBeTrue();
      expect(component.roleForm.get('organization_id')?.disabled).toBeTrue();
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      spyOn(component.roleForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.roleForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        component.roleForm.patchValue({
          role_code: 'NEW_ROLE',
          role_name: 'New Role',
          description: 'A new role'
        });
      });

      it('should successfully submit new role', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Role Created', 'The new role has been successfully created.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
        fetchReq.flush({ data: mockRoles });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to create role.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockRoles[0] as any);
        component.roleForm.patchValue({ role_name: 'Updated Role' });
      });

      it('should successfully submit edited role', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Role Updated', 'The role has been successfully updated.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
        fetchReq.flush({ data: mockRoles });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update role.');
      });
    });

    describe('Close Form', () => {
      it('should close form immediately if pristine', fakeAsync(() => {
        component.openCreateForm();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should close form immediately if force=true even if dirty', fakeAsync(() => {
        component.openCreateForm();
        component.roleForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        component.roleForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        component.roleForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Delete Role', () => {
    it('should delete role if confirmed', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
      component.deleteRole('role-uuid-1');
      tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(mockToastService.success).toHaveBeenCalledWith('Role Deleted', 'The role was removed successfully.');
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
      fetchReq.flush({ data: [] });
    }));

    it('should not delete role if rejected', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
      component.deleteRole('role-uuid-1');
      tick();
      httpMock.expectNone(`${environment.apiUrl}/security/roles/role-uuid-1`);
    }));
  });

  describe('Permissions Matrix', () => {
    it('should open permissions modal and set selected permissions', () => {
      component.openPermissionsModal(mockRoles[0] as any);
      expect(component.isPermissionsModalOpen).toBeTrue();
      expect(component.activeRoleForPermissions).toBeTruthy();
      expect(component.selectedPermissionUuids.has('perm-uuid-1')).toBeTrue();
      expect(component.isPermissionsDirty).toBeFalse();
    });

    it('should handle role without permissions safely', () => {
      const roleWithoutPerms = { ...mockRoles[0], relationships: {} };
      component.openPermissionsModal(roleWithoutPerms as any);
      expect(component.isPermissionsModalOpen).toBeTrue();
      expect(component.selectedPermissionUuids.size).toBe(0);
    });

    it('should toggle permission', () => {
      component.openPermissionsModal(mockRoles[0] as any);
      expect(component.isPermissionSelected('perm-uuid-1')).toBeTrue();
      
      component.togglePermission('perm-uuid-1');
      expect(component.isPermissionSelected('perm-uuid-1')).toBeFalse();
      expect(component.isPermissionsDirty).toBeTrue();

      component.togglePermission('perm-uuid-1');
      expect(component.isPermissionSelected('perm-uuid-1')).toBeTrue();
    });

    describe('Close Permissions Modal', () => {
      it('should close immediately if pristine', fakeAsync(() => {
        component.openPermissionsModal(mockRoles[0] as any);
        component.closePermissionsModal();
        tick();
        expect(component.isPermissionsModalOpen).toBeFalse();
      }));

      it('should prompt if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openPermissionsModal(mockRoles[0] as any);
        component.togglePermission('perm-uuid-1');
        component.closePermissionsModal();
        tick();
        expect(component.isPermissionsModalOpen).toBeFalse();
      }));

      it('should prompt if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openPermissionsModal(mockRoles[0] as any);
        component.togglePermission('perm-uuid-1');
        component.closePermissionsModal();
        tick();
        expect(component.isPermissionsModalOpen).toBeTrue();
      }));
    });

    describe('Save Permissions', () => {
      beforeEach(() => {
        component.openPermissionsModal(mockRoles[0] as any);
      });

      it('should save permissions successfully', () => {
        component.savePermissions();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1/permissions`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.permission_uuids).toEqual(['perm-uuid-1']);
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Permissions Saved', 'The role permissions have been updated successfully.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/roles?include=permissions`);
        fetchReq.flush({ data: mockRoles });
      });

      it('should handle save permissions error', () => {
        component.savePermissions();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1/permissions`);
        req.flush({ message: 'Save failed' }, { status: 400, statusText: 'Bad Request' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Save failed');
      });
      
      it('should handle save permissions error with fallback message', () => {
        component.savePermissions();
        const req = httpMock.expectOne(`${environment.apiUrl}/security/roles/role-uuid-1/permissions`);
        req.flush(null, { status: 500, statusText: 'Server Error' });

        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to save permissions.');
      });

      it('should do nothing if activeRoleForPermissions is null', () => {
        component.activeRoleForPermissions = null;
        component.savePermissions();
        httpMock.expectNone(`${environment.apiUrl}/security/roles/role-uuid-1/permissions`);
      });
    });

    describe('Format Permission Name', () => {
      it('should format 3-part code correctly', () => {
        expect(component.formatPermissionName('Assessment.QuestionBanks.Manage')).toBe('Manage Question Banks');
      });

      it('should format 2-part code correctly', () => {
        expect(component.formatPermissionName('Global.View')).toBe('View Global');
      });

      it('should return original code if no dots', () => {
        expect(component.formatPermissionName('Admin')).toBe('Admin');
      });

      it('should return empty string if null', () => {
        expect(component.formatPermissionName(null as any)).toBe('');
      });
    });
  });
});
