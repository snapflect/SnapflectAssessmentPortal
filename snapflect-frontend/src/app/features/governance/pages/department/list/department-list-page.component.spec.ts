import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DepartmentListPageComponent } from './department-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('DepartmentListPageComponent', () => {
  let component: DepartmentListPageComponent;
  let fixture: ComponentFixture<DepartmentListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;

  const mockDepts = [
    {
      id: 1,
      uuid: 'dept-uuid-1',
      attributes: {
        organization_id: 1,
        business_unit_id: 1,
        department_code: 'ENG',
        department_name: 'Engineering',
        status: 'ACTIVE'
      },
      relationships: {
        business_unit: { attributes: { business_unit_name: 'BU 1' } }
      }
    }
  ];

  const mockOrgs = [
    { id: 1, attributes: { organization_name: 'Org 1' } }
  ];

  const mockBUs = [
    { id: 1, attributes: { organization_id: 1, business_unit_name: 'BU 1' } },
    { id: 2, attributes: { organization_id: 2, business_unit_name: 'BU 2' } }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockConfirmService = jasmine.createSpyObj('ConfirmService', ['confirm']);
    mockConfirmService.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        DepartmentListPageComponent,
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

    fixture = TestBed.createComponent(DepartmentListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    const deptsReq = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
    deptsReq.flush({ data: mockDepts });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush({ data: mockOrgs });

    const busReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units?per_page=100`);
    busReq.flush({ data: mockBUs });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(component.departments.length).toBe(1);
    expect(component.organizations.length).toBe(1);
    expect(component.businessUnits.length).toBe(2);
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchDepartments();
    const deptsReq = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
    deptsReq.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.loading).toBeFalse();
  });

  describe('onOrgChange', () => {
    it('should filter business units when org is selected', () => {
      component.deptForm.patchValue({ organization_id: 1 });
      component.onOrgChange();
      expect(component.filteredBusinessUnits.length).toBe(1);
      expect(component.filteredBusinessUnits[0].id).toBe(1);
      expect(component.deptForm.get('business_unit_id')?.value).toBeNull();
    });

    it('should clear filtered business units when org is deselected', () => {
      component.deptForm.patchValue({ organization_id: null });
      component.onOrgChange();
      expect(component.filteredBusinessUnits.length).toBe(0);
      expect(component.deptForm.get('business_unit_id')?.value).toBeNull();
    });
  });

  describe('Form Handling', () => {
    it('should open create form and reset state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.deptForm.get('organization_id')?.value).toBe(1); // Defaults to first org
      expect(component.filteredBusinessUnits.length).toBe(1);
    });

    it('should open create form with null org if organizations array is empty', () => {
      component.organizations = [];
      component.openCreateForm();
      expect(component.deptForm.get('organization_id')?.value).toBeNull();
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockDepts[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('dept-uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.deptForm.get('department_code')?.disabled).toBeTrue();
      expect(component.deptForm.get('organization_id')?.disabled).toBeTrue();
      expect(component.deptForm.get('business_unit_id')?.disabled).toBeTrue();
      expect(component.filteredBusinessUnits.length).toBe(1);
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      spyOn(component.deptForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.deptForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        component.deptForm.patchValue({
          organization_id: 1,
          business_unit_id: 1,
          department_code: 'NEW',
          department_name: 'New Dept'
        });
      });

      it('should successfully submit new department', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Department Created', 'The new department has been successfully created.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
        fetchReq.flush({ data: mockDepts });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to create department.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockDepts[0] as any);
        component.deptForm.patchValue({ department_name: 'Updated Dept' });
      });

      it('should successfully submit edited department', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments/dept-uuid-1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Department Updated', 'The department has been successfully updated.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
        fetchReq.flush({ data: mockDepts });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments/dept-uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments/dept-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update department.');
      });
    });

    describe('Close Form', () => {
      it('should close form immediately if pristine', fakeAsync(() => {
        component.openCreateForm();
        component.deptForm.markAsPristine();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should close form immediately if force=true even if dirty', fakeAsync(() => {
        component.openCreateForm();
        component.deptForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        component.deptForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        component.deptForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Delete Department', () => {
    it('should delete department if confirmed', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
      component.deleteDept('dept-uuid-1');
      tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/governance/departments/dept-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(mockToastService.success).toHaveBeenCalledWith('Department Deleted', 'The department was removed successfully.');
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/departments`);
      fetchReq.flush({ data: [] });
    }));

    it('should not delete department if rejected', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
      component.deleteDept('dept-uuid-1');
      tick();
      httpMock.expectNone(`${environment.apiUrl}/governance/departments/dept-uuid-1`);
    }));
  });
});
