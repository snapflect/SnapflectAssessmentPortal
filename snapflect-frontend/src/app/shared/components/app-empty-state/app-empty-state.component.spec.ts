import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppEmptyStateComponent } from './app-empty-state.component';

describe('AppEmptyStateComponent', () => {
  let component: AppEmptyStateComponent;
  let fixture: ComponentFixture<AppEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppEmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('No data available.');
  });

  it('should render custom message when provided', () => {
    fixture.componentRef.setInput('message', 'Custom empty message');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Custom empty message');
  });
});
