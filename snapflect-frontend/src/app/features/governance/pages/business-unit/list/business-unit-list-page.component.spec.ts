import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BusinessUnitListPageComponent } from './business-unit-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('BusinessUnitListPageComponent', () => {
  let component: BusinessUnitListPageComponent;
  let fixture: ComponentFixture<BusinessUnitListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;

  const mockBUs = [
    {
      id: 1,
      uuid: 'bu-uuid-1',
      attributes: {
        organization_id: 1,
        business_unit_code: 'SALES',
        business_unit_name: 'Sales',
        status: 'ACTIVE'
      }
    }
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
        BusinessUnitListPageComponent,
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

    fixture = TestBed.createComponent(BusinessUnitListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    const busReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
    busReq.flush({ data: mockBUs });

    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush({ data: mockOrgs });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(component.businessUnits.length).toBe(1);
    expect(component.organizations.length).toBe(1);
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchBUs();
    const busReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
    busReq.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.loading).toBeFalse();
  });

  describe('Form Handling', () => {
    it('should open create form and reset state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.buForm.get('organization_id')?.value).toBe(1); // Defaults to first org
    });

    it('should open create form with null org if organizations array is empty', () => {
      component.organizations = [];
      component.openCreateForm();
      expect(component.buForm.get('organization_id')?.value).toBeNull();
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockBUs[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('bu-uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.buForm.get('organization_id')?.disabled).toBeTrue();
      expect(component.buForm.get('business_unit_code')?.disabled).toBeTrue();
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      spyOn(component.buForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.buForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        component.buForm.patchValue({
          organization_id: 1,
          business_unit_code: 'NEW',
          business_unit_name: 'New BU'
        });
      });

      it('should successfully submit new business unit', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Business Unit Created', 'The new business unit has been successfully created.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
        fetchReq.flush({ data: mockBUs });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to create business unit.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockBUs[0] as any);
        component.buForm.patchValue({ business_unit_name: 'Updated BU' });
      });

      it('should successfully submit edited business unit', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units/bu-uuid-1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Business Unit Updated', 'The business unit has been successfully updated.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
        fetchReq.flush({ data: mockBUs });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units/bu-uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units/bu-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update business unit.');
      });
    });

    describe('Close Form', () => {
      it('should close form immediately if pristine', fakeAsync(() => {
        component.openCreateForm();
        component.buForm.markAsPristine();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should close form immediately if force=true even if dirty', fakeAsync(() => {
        component.openCreateForm();
        component.buForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        component.buForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        component.buForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Delete Business Unit', () => {
    it('should delete business unit if confirmed', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
      component.deleteBU('bu-uuid-1');
      tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/governance/business-units/bu-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(mockToastService.success).toHaveBeenCalledWith('Business Unit Deleted', 'The business unit was removed successfully.');
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/business-units`);
      fetchReq.flush({ data: [] });
    }));

    it('should not delete business unit if rejected', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
      component.deleteBU('bu-uuid-1');
      tick();
      httpMock.expectNone(`${environment.apiUrl}/governance/business-units/bu-uuid-1`);
    }));
  });
});
