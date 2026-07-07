import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoicesPageComponent } from './invoices-page.component';

describe('InvoicesPageComponent', () => {
  let component: InvoicesPageComponent;
  let fixture: ComponentFixture<InvoicesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Selection Logic', () => {
    it('should toggle selection for a single invoice', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      const id = component.invoices[0].id;

      component.toggleSelection(id, mockEvent);
      expect(component.selectedInvoices.has(id)).toBeTrue();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      component.toggleSelection(id, mockEvent);
      expect(component.selectedInvoices.has(id)).toBeFalse();
    });

    it('should toggle selection for a single invoice without event', () => {
      const id = component.invoices[0].id;
      component.toggleSelection(id);
      expect(component.selectedInvoices.has(id)).toBeTrue();
    });

    it('should correctly compute allSelected and partialSelected', () => {
      expect(component.allSelected).toBeFalse();
      expect(component.partialSelected).toBeFalse();

      component.toggleSelection(component.invoices[0].id);
      expect(component.allSelected).toBeFalse();
      expect(component.partialSelected).toBeTrue();

      component.invoices.forEach(inv => component.selectedInvoices.add(inv.id));
      expect(component.allSelected).toBeTrue();
      expect(component.partialSelected).toBeFalse();
    });

    it('should toggle all selections', () => {
      component.toggleAll();
      expect(component.allSelected).toBeTrue();
      expect(component.selectedInvoices.size).toBe(component.invoices.length);

      component.toggleAll();
      expect(component.allSelected).toBeFalse();
      expect(component.selectedInvoices.size).toBe(0);
    });
  });

  describe('Download Logic', () => {
    let originalCreateObjectURL: any;
    let originalRevokeObjectURL: any;

    beforeEach(() => {
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = jasmine.createSpy('createObjectURL').and.returnValue('blob:url');
      URL.revokeObjectURL = jasmine.createSpy('revokeObjectURL');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('should download a single invoice', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      const invoice = component.invoices[0];
      
      const linkSpy = jasmine.createSpyObj('a', ['setAttribute', 'click']);
      linkSpy.style = {};
      spyOn(document, 'createElement').and.returnValue(linkSpy as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      component.downloadSingle(invoice, mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(linkSpy.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
      expect(linkSpy.setAttribute).toHaveBeenCalledWith('download', `${invoice.id}.csv`);
      expect(document.body.appendChild).toHaveBeenCalledWith(linkSpy as any);
      expect(linkSpy.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(linkSpy as any);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });

    it('should download selected invoices (partial)', () => {
      component.toggleSelection(component.invoices[0].id);
      component.toggleSelection(component.invoices[1].id);

      const linkSpy = jasmine.createSpyObj('a', ['setAttribute', 'click']);
      linkSpy.style = {};
      spyOn(document, 'createElement').and.returnValue(linkSpy as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      component.downloadSelected();

      expect(linkSpy.setAttribute.calls.argsFor(1)[0]).toBe('download');
      expect(linkSpy.setAttribute.calls.argsFor(1)[1]).toMatch(/snapflect-invoices-\d+.csv/);
      expect(linkSpy.click).toHaveBeenCalled();
    });

    it('should download all invoices if none selected', () => {
      expect(component.selectedInvoices.size).toBe(0);

      const linkSpy = jasmine.createSpyObj('a', ['setAttribute', 'click']);
      linkSpy.style = {};
      spyOn(document, 'createElement').and.returnValue(linkSpy as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      component.downloadSelected();

      expect(linkSpy.setAttribute.calls.argsFor(1)[0]).toBe('download');
      expect(linkSpy.setAttribute.calls.argsFor(1)[1]).toMatch(/snapflect-invoices-\d+.csv/);
      expect(linkSpy.click).toHaveBeenCalled();
    });

    it('should not download if invoices array is empty (edge case)', () => {
      component.invoices = [];
      component.downloadSelected();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });
});
