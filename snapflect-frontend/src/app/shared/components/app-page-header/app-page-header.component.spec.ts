import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppPageHeaderComponent } from './app-page-header.component';

describe('AppPageHeaderComponent', () => {
  let component: AppPageHeaderComponent;
  let fixture: ComponentFixture<AppPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPageHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Initial Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Initial Title');
  });

  it('should update the title when input changes', () => {
    fixture.componentRef.setInput('title', 'Updated Title');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Updated Title');
  });
});
