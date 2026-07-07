import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultStatusBadgeComponent } from './result-status-badge.component';
import { By } from '@angular/platform-browser';

describe('ResultStatusBadgeComponent', () => {
  let component: ResultStatusBadgeComponent;
  let fixture: ComponentFixture<ResultStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultStatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultStatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render passed status correctly', () => {
    component.status = 'passed';
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    expect(badge.textContent.trim()).toBe('Passed');
    expect(badge.classList.contains('badge-success')).toBeTrue();
  });

  it('should render failed status correctly', () => {
    component.status = 'failed';
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    expect(badge.textContent.trim()).toBe('Failed');
    expect(badge.classList.contains('badge-danger')).toBeTrue();
  });

  it('should render pending status correctly', () => {
    component.status = 'pending';
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    expect(badge.textContent.trim()).toBe('Pending');
    expect(badge.classList.contains('badge-warning')).toBeTrue();
  });

  it('should render review_required status correctly', () => {
    component.status = 'review_required';
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    expect(badge.textContent.trim()).toBe('Needs Review');
    expect(badge.classList.contains('badge-info')).toBeTrue();
  });

  it('should render unknown status as fallback', () => {
    component.status = 'unknown';
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    expect(badge.textContent.trim()).toBe('Unknown');
    expect(badge.classList.contains('badge-secondary')).toBeTrue();
  });
});
