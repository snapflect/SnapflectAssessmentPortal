import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendChartComponent } from './trend-chart.component';

describe('TrendChartComponent', () => {
  let component: TrendChartComponent;
  let fixture: ComponentFixture<TrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('div')?.textContent).toContain('TrendChartComponent Scaffolded');
  });
});