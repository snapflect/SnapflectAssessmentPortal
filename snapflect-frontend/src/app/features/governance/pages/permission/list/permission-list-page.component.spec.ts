import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { PermissionListPageComponent } from './permission-list-page.component';
import { environment } from '../../../../../../environments/environment';

describe('PermissionListPageComponent', () => {
  let component: PermissionListPageComponent;
  let fixture: ComponentFixture<PermissionListPageComponent>;
  let httpMock: HttpTestingController;

  const mockPermissions = [
    {
      id: 1,
      uuid: 'perm-uuid-1',
      attributes: {
        permission_code: 'System.Users.Manage',
        permission_name: 'Manage Users',
        description: 'Allows managing users',
        module: 'System',
        is_system_permission: true
      }
    },
    {
      id: 2,
      uuid: 'perm-uuid-2',
      attributes: {
        permission_code: 'Governance.Roles.View',
        permission_name: '',
        description: '',
        module: '',
        is_system_permission: false
      }
    }
  ];

  beforeEach(async () => {
    spyOn(window, 'alert');

    await TestBed.configureTestingModule({
      imports: [
        PermissionListPageComponent,
        HttpClientTestingModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    const permsReq = httpMock.expectOne(`${environment.apiUrl}/security/permissions?per_page=100`);
    permsReq.flush({ data: mockPermissions });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(component.permissions.length).toBe(2);
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchPermissions();
    const permsReq = httpMock.expectOne(`${environment.apiUrl}/security/permissions?per_page=100`);
    permsReq.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.loading).toBeFalse();
  });

  describe('Modal Handling', () => {
    it('should open create modal and reset newPermission', () => {
      component.newPermission.permission_code = 'OLD';
      component.openCreateModal();
      expect(component.showCreateModal).toBeTrue();
      expect(component.newPermission.permission_code).toBe('');
      expect(component.newPermission.module).toBe('Governance');
    });

    it('should close create modal', () => {
      component.openCreateModal();
      component.closeCreateModal();
      expect(component.showCreateModal).toBeFalse();
    });
  });

  describe('Create Submission', () => {
    it('should show alert and return if code or name is missing', () => {
      component.openCreateModal();
      component.newPermission.permission_code = '';
      component.newPermission.permission_name = 'Name';
      component.createPermission();
      expect(window.alert).toHaveBeenCalledWith('Code and Name are required.');
      
      component.newPermission.permission_code = 'Code';
      component.newPermission.permission_name = '';
      component.createPermission();
      expect(window.alert).toHaveBeenCalledWith('Code and Name are required.');
      
      httpMock.expectNone(`${environment.apiUrl}/security/permissions`);
    });

    it('should successfully submit new permission', () => {
      component.openCreateModal();
      component.newPermission.permission_code = 'NEW_CODE';
      component.newPermission.permission_name = 'New Perm';
      component.createPermission();

      const req = httpMock.expectOne(`${environment.apiUrl}/security/permissions`);
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(component.showCreateModal).toBeFalse();
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/security/permissions?per_page=100`);
      fetchReq.flush({ data: mockPermissions });
    });

    it('should handle creation error', () => {
      component.openCreateModal();
      component.newPermission.permission_code = 'NEW_CODE';
      component.newPermission.permission_name = 'New Perm';
      component.createPermission();

      const req = httpMock.expectOne(`${environment.apiUrl}/security/permissions`);
      req.flush({ message: 'Already exists' }, { status: 400, statusText: 'Bad Request' });

      expect(window.alert).toHaveBeenCalledWith('Failed to create permission. It may already exist.');
      expect(component.submitting).toBeFalse();
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
