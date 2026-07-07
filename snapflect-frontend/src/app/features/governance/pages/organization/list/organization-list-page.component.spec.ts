import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrganizationListPageComponent } from './organization-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('OrganizationListPageComponent', () => {
  let component: OrganizationListPageComponent;
  let fixture: ComponentFixture<OrganizationListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;

  const mockOrgs = [
    {
      id: 1,
      uuid: 'uuid-1',
      attributes: {
        organization_code: 'ORG1',
        organization_name: 'Organization 1',
        contact_email: 'org1@example.com',
        status: 'ACTIVE'
      }
    }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmService', ['confirm']);
    mockConfirmService.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        OrganizationListPageComponent,
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

    fixture = TestBed.createComponent(OrganizationListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    // Handle the initial fetch request
    const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
    req.flush({ data: mockOrgs });

    const planReq = httpMock.expectOne(`${environment.apiUrl}/billing/plans`);
    planReq.flush({ data: [] });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch organizations on init', () => {
    expect(component).toBeTruthy();
    expect(component.organizations.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchOrganizations();
    const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.loading).toBeFalse();
    // In actual component, it logs to console, but component doesn't break
  });

  describe('Form Handling', () => {
    it('should open create form and reset form state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.orgForm.enabled).toBeTrue();
      expect(component.orgForm.get('organization_code')?.value).toBe(null);
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockOrgs[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.orgForm.get('organization_code')?.value).toBe('ORG1');
      expect(component.orgForm.get('organization_code')?.disabled).toBeTrue();
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      spyOn(component.orgForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.orgForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        component.orgForm.patchValue({
          organization_code: 'NEW',
          organization_name: 'New Org',
          contact_email: 'new@test.com',
          plan_code: 'BASIC_1M',
          payment_reference: 'REF123'
        });
      });

      it('should successfully submit new organization', () => {
        component.submitForm();
        expect(component.submitting).toBeTrue();

        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Organization Created', 'The new organization has been successfully created.');
        expect(component.isSlideOverOpen).toBeFalse();
        
        // Follow up fetch calls
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
        fetchReq.flush({ data: mockOrgs });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        
        expect(component.submitting).toBeFalse();
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error without specific message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        
        expect(component.submitting).toBeFalse();
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to create organization.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockOrgs[0] as any);
        component.orgForm.patchValue({
          organization_name: 'Updated Org'
        });
      });

      it('should successfully submit edited organization', () => {
        component.submitForm();
        expect(component.submitting).toBeTrue();

        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations/uuid-1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Organization Updated', 'The organization has been successfully updated.');
        expect(component.isSlideOverOpen).toBeFalse();
        
        // Follow up fetch calls
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
        fetchReq.flush({ data: mockOrgs });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations/uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        
        expect(component.submitting).toBeFalse();
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error without specific message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations/uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        
        expect(component.submitting).toBeFalse();
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update organization.');
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
        component.orgForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        component.orgForm.markAsDirty();
        component.closeForm();
        tick();
        expect(mockConfirmService.confirm).toHaveBeenCalled();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        component.orgForm.markAsDirty();
        component.closeForm();
        tick();
        expect(mockConfirmService.confirm).toHaveBeenCalled();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Delete Organization', () => {
    it('should delete organization if confirmed', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
      component.deleteOrg('uuid-1');
      tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/governance/organizations/uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(mockToastService.success).toHaveBeenCalledWith('Organization Deleted', 'The organization was removed successfully.');
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations`);
      fetchReq.flush({ data: [] });
    }));

    it('should not delete organization if rejected', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
      component.deleteOrg('uuid-1');
      tick();

      httpMock.expectNone(`${environment.apiUrl}/governance/organizations/uuid-1`);
    }));
  });
});
