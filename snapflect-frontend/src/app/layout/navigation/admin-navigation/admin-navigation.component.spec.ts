import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminNavigationComponent } from './admin-navigation.component';
import { provideRouter } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

describe('AdminNavigationComponent', () => {
  let component: AdminNavigationComponent;
  let fixture: ComponentFixture<AdminNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNavigationComponent, MatListModule, MatIconModule],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all navigation sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = compiled.querySelectorAll('.nav-section');
    expect(sections.length).toBe(3);
    expect(sections[0].textContent).toContain('PLATFORM ADMIN');
    expect(sections[1].textContent).toContain('ORGANIZATION ADMIN');
    expect(sections[2].textContent).toContain('EVALUATOR');
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[mat-list-item]');
    expect(links.length).toBe(5);
    
    // Check specific links
    const hrefs = Array.from(links).map(link => link.getAttribute('ng-reflect-router-link'));
    expect(hrefs).toContain('/admin/organizations');
    expect(hrefs).toContain('/admin/users');
    expect(hrefs).toContain('/admin/assessments');
    expect(hrefs).toContain('/admin/results');
    expect(hrefs).toContain('/admin/reviews');
  });
});
