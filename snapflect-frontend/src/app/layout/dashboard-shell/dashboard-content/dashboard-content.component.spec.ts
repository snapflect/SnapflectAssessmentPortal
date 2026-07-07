import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardContentComponent } from './dashboard-content.component';
import { MatCardModule } from '@angular/material/card';

describe('DashboardContentComponent', () => {
  let component: DashboardContentComponent;
  let fixture: ComponentFixture<DashboardContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardContentComponent, MatCardModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render mat-card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card.dashboard-content-card')).toBeTruthy();
    expect(compiled.querySelector('mat-card-content')).toBeTruthy();
  });
});
