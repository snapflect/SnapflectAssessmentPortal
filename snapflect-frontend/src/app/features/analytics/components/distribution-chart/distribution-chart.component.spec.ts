import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistributionChartComponent } from './distribution-chart.component';

describe('DistributionChartComponent', () => {
  let component: DistributionChartComponent;
  let fixture: ComponentFixture<DistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')?.textContent).toContain('DistributionChartComponent Scaffolded');
  });
});