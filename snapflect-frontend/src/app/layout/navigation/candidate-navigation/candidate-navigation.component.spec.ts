import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateNavigationComponent } from './candidate-navigation.component';
import { provideRouter } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

describe('CandidateNavigationComponent', () => {
  let component: CandidateNavigationComponent;
  let fixture: ComponentFixture<CandidateNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateNavigationComponent, MatButtonModule],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('button[mat-button]');
    expect(links.length).toBe(3);
    
    // Check specific links
    const hrefs = Array.from(links).map(link => link.getAttribute('ng-reflect-router-link'));
    expect(hrefs).toContain('/candidate/dashboard');
    expect(hrefs).toContain('/candidate/assessments');
    expect(hrefs).toContain('/candidate/results');
  });
});
