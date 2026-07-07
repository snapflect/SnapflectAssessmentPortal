import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LocationListPageComponent } from './location-list-page.component';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { environment } from '../../../../../../environments/environment';

describe('LocationListPageComponent', () => {
  let component: LocationListPageComponent;
  let fixture: ComponentFixture<LocationListPageComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: any;
  let mockConfirmService: any;

  const mockLocations = [
    {
      id: 1,
      uuid: 'loc-uuid-1',
      attributes: {
        organization_id: 1,
        location_code: 'HQ-NY',
        location_name: 'New York HQ',
        city: 'New York',
        country: 'USA',
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
        LocationListPageComponent,
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

    fixture = TestBed.createComponent(LocationListPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    
    const orgsReq = httpMock.expectOne(`${environment.apiUrl}/governance/organizations?per_page=100`);
    orgsReq.flush({ data: mockOrgs });

    const locsReq = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
    locsReq.flush({ data: mockLocations });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch data on init', () => {
    expect(component).toBeTruthy();
    expect(component.locations.length).toBe(1);
    expect(component.organizations.length).toBe(1);
  });

  it('should handle fetch errors gracefully', () => {
    component.fetchLocations();
    const locsReq = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
    locsReq.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.loading).toBeFalse();
  });

  describe('Form Handling', () => {
    it('should open create form and reset state', () => {
      component.openCreateForm();
      expect(component.isEditing).toBeFalse();
      expect(component.currentEditUuid).toBeNull();
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.locForm.get('organization_id')?.value).toBe(1); // Defaults to first org
    });

    it('should open create form with null org if organizations array is empty', () => {
      component.organizations = [];
      component.openCreateForm();
      expect(component.locForm.get('organization_id')?.value).toBeNull();
    });

    it('should open edit form and patch values', () => {
      component.openEditForm(mockLocations[0] as any);
      expect(component.isEditing).toBeTrue();
      expect(component.currentEditUuid).toBe('loc-uuid-1');
      expect(component.isSlideOverOpen).toBeTrue();
      expect(component.locForm.get('location_code')?.disabled).toBeTrue();
    });

    it('should abort submit if form is invalid', () => {
      component.openCreateForm();
      spyOn(component.locForm, 'markAllAsTouched');
      component.submitForm();
      expect(component.locForm.markAllAsTouched).toHaveBeenCalled();
    });

    describe('Create Submission', () => {
      beforeEach(() => {
        component.openCreateForm();
        component.locForm.patchValue({
          organization_id: 1,
          location_code: 'NEW',
          location_name: 'New Location',
          city: 'City',
          country: 'Country'
        });
      });

      it('should successfully submit new location', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
        expect(req.request.method).toBe('POST');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Location Created', 'The new location has been successfully created.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
        fetchReq.flush({ data: mockLocations });
      });

      it('should handle creation error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
        req.flush({ message: 'Error creating' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Error creating');
      });
      
      it('should handle creation error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to create location.');
      });
    });

    describe('Edit Submission', () => {
      beforeEach(() => {
        component.openEditForm(mockLocations[0] as any);
        component.locForm.patchValue({ location_name: 'Updated Location' });
      });

      it('should successfully submit edited location', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations/loc-uuid-1`);
        expect(req.request.method).toBe('PUT');
        req.flush({});

        expect(mockToastService.success).toHaveBeenCalledWith('Location Updated', 'The location has been successfully updated.');
        
        const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
        fetchReq.flush({ data: mockLocations });
      });

      it('should handle edit error', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations/loc-uuid-1`);
        req.flush({ message: 'Update failed' }, { status: 400, statusText: 'Bad Request' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Update failed');
      });
      
      it('should handle edit error with fallback message', () => {
        component.submitForm();
        const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations/loc-uuid-1`);
        req.flush(null, { status: 500, statusText: 'Server Error' });
        expect(mockToastService.error).toHaveBeenCalledWith('Error', 'Failed to update location.');
      });
    });

    describe('Close Form', () => {
      it('should close form immediately if pristine', fakeAsync(() => {
        component.openCreateForm();
        component.locForm.markAsPristine();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should close form immediately if force=true even if dirty', fakeAsync(() => {
        component.openCreateForm();
        component.locForm.markAsDirty();
        component.closeForm(true);
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and close if confirmed', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
        component.openCreateForm();
        component.locForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeFalse();
      }));

      it('should prompt confirmation if dirty and stay open if rejected', fakeAsync(() => {
        mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
        component.openCreateForm();
        component.locForm.markAsDirty();
        component.closeForm();
        tick();
        expect(component.isSlideOverOpen).toBeTrue();
      }));
    });
  });

  describe('Delete Location', () => {
    it('should delete location if confirmed', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(true));
      component.deleteLoc('loc-uuid-1');
      tick();

      const req = httpMock.expectOne(`${environment.apiUrl}/governance/locations/loc-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(mockToastService.success).toHaveBeenCalledWith('Location Deleted', 'The location was removed successfully.');
      
      const fetchReq = httpMock.expectOne(`${environment.apiUrl}/governance/locations`);
      fetchReq.flush({ data: [] });
    }));

    it('should not delete location if rejected', fakeAsync(() => {
      mockConfirmService.confirm.and.returnValue(Promise.resolve(false));
      component.deleteLoc('loc-uuid-1');
      tick();
      httpMock.expectNone(`${environment.apiUrl}/governance/locations/loc-uuid-1`);
    }));
  });
});
