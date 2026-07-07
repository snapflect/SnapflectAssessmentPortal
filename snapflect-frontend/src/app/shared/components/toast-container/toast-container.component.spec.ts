import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../../../core/services/toast.service';
import { signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockToastService {
  toasts: WritableSignal<any[]> = signal([
    { id: '1', type: 'success', title: 'Success', message: 'Test success' },
    { id: '2', type: 'error', title: 'Error', message: 'Test error' },
    { id: '3', type: 'warning', title: 'Warning', message: 'Test warning', durationMs: 3000 },
    { id: '4', type: 'info', title: 'Info', message: 'Test info' }
  ]);
  remove = jasmine.createSpy('remove');
}

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastService: MockToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent, NoopAnimationsModule],
      providers: [
        { provide: ToastService, useClass: MockToastService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as unknown as MockToastService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toasts from service', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h4s = compiled.querySelectorAll('h4');
    expect(h4s.length).toBe(4);
    expect(h4s[0].textContent).toContain('Success');
    expect(h4s[1].textContent).toContain('Error');
  });

  it('should call remove on service when close button clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    buttons[0].click();
    expect(toastService.remove).toHaveBeenCalledWith('1');
  });

  it('should return correct toast classes based on type', () => {
    expect(component.getToastClasses('success')).toContain('emerald');
    expect(component.getToastClasses('error')).toContain('red');
    expect(component.getToastClasses('warning')).toContain('amber');
    expect(component.getToastClasses('info')).toContain('blue');
    expect(component.getToastClasses('unknown' as any)).toContain('gray');
  });

  it('should render progress bar if durationMs is provided and > 0', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toasts = compiled.querySelectorAll('.pointer-events-auto');
    expect(toasts[2].querySelector('.bg-white\\/20')).toBeTruthy();
    expect(toasts[0].querySelector('.bg-white\\/20')).toBeNull();
  });

  it('should render correct SVG icons based on type', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toasts = compiled.querySelectorAll('.pointer-events-auto');
    expect(toasts[0].querySelector('svg.text-white')).toBeTruthy();
    expect(toasts[1].querySelector('svg.text-white')).toBeTruthy();
    expect(toasts[2].querySelector('svg.text-white')).toBeTruthy();
    expect(toasts[3].querySelector('svg.text-white')).toBeTruthy();
  });
});
