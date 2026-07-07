import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlideOverComponent } from './slide-over.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SlideOverComponent', () => {
  let component: SlideOverComponent;
  let fixture: ComponentFixture<SlideOverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideOverComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeEvent when close is called', () => {
    spyOn(component.closeEvent, 'emit');
    component.close();
    expect(component.closeEvent.emit).toHaveBeenCalled();
  });

  it('should render title and subtitle when open', () => {
    component.isOpen = true;
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Test Title');
    expect(compiled.querySelector('p')?.textContent).toContain('Test Subtitle');
  });
});
