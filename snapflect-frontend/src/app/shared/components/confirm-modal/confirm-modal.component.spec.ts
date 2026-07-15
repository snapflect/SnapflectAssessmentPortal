import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { ConfirmService } from '../../../core/services/confirm.service';
import { signal, WritableSignal } from '@angular/core';

class MockConfirmService {
  state: WritableSignal<any> = signal({ 
    isOpen: true, 
    options: { title: 'Test Confirm', message: 'Are you sure?', variant: 'danger', confirmText: 'Yes', cancelText: 'No' } 
  });
  resolve = jasmine.createSpy('resolve');
}

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let confirmService: MockConfirmService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
      providers: [
        { provide: ConfirmService, useClass: MockConfirmService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    confirmService = TestBed.inject(ConfirmService) as unknown as MockConfirmService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render modal content when open', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Test Confirm');
    expect(compiled.querySelector('p')?.textContent).toContain('Are you sure?');
    const buttons = compiled.querySelectorAll('button');
    expect(buttons[0].textContent).toContain('No');
    expect(buttons[1].textContent).toContain('Yes');
  });

  it('should not render anything when isOpen is false', () => {
    confirmService.state.set({ isOpen: false });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fixed')).toBeNull();
  });

  it('should call resolve(true) on confirm', () => {
    component.confirm();
    expect(confirmService.resolve).toHaveBeenCalledWith(true);
  });

  it('should call resolve(false) on cancel', () => {
    component.cancel();
    expect(confirmService.resolve).toHaveBeenCalledWith(false);
  });

  it('should call cancel when backdrop is clicked', () => {
    spyOn(component, 'cancel');
    const compiled = fixture.nativeElement as HTMLElement;
    const backdrop = compiled.querySelector('.bg-black\\/60') as HTMLElement;
    backdrop.click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should return correct icon container class', () => {
    expect(component.getIconContainerClass('danger')).toContain('bg-danger/10');
    expect(component.getIconContainerClass('warning')).toContain('bg-warning/10');
    expect(component.getIconContainerClass('info')).toContain('bg-info/10');
    expect(component.getIconContainerClass()).toContain('bg-info/10');
  });

  it('should return correct confirm button class based on variant', () => {
    expect(component.getConfirmButtonClass('danger')).toContain('bg-danger');
    expect(component.getConfirmButtonClass('warning')).toContain('bg-warning');
    expect(component.getConfirmButtonClass('info')).toContain('bg-brand');
    expect(component.getConfirmButtonClass()).toContain('bg-brand');
  });

  it('should render correct SVG based on variant', () => {
    confirmService.state.set({ isOpen: true, options: { variant: 'danger' } });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('svg.text-danger')).toBeTruthy();
    
    confirmService.state.set({ isOpen: true, options: { variant: 'warning' } });
    fixture.detectChanges();
    expect(compiled.querySelector('svg.text-amber-400')).toBeTruthy();
    
    confirmService.state.set({ isOpen: true, options: { variant: 'info' } });
    fixture.detectChanges();
    expect(compiled.querySelector('svg.text-blue-400')).toBeTruthy();
    
    confirmService.state.set({ isOpen: true, options: { } }); // default
    fixture.detectChanges();
    expect(compiled.querySelector('svg.text-blue-400')).toBeTruthy();
  });
});
