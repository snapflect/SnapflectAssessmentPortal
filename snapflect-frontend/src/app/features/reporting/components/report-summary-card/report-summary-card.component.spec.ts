import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportSummaryCardComponent } from './report-summary-card.component';

describe('ReportSummaryCardComponent', () => {
  let component: ReportSummaryCardComponent;
  let fixture: ComponentFixture<ReportSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSummaryCardComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and value', () => {
    component.title = 'Total Candidates';
    component.value = 1500;
    fixture.detectChanges();
    
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Total Candidates');
    expect(element.textContent).toContain('1500');
  });

  it('should display positive trend with emerald class', () => {
    component.trend = 15;
    fixture.detectChanges();
    
    const trendEl = fixture.nativeElement.querySelector('.text-emerald-500');
    expect(trendEl).toBeTruthy();
    expect(trendEl.textContent).toContain('+15%');
  });

  it('should display negative trend with rose class', () => {
    component.trend = -5;
    fixture.detectChanges();
    
    const trendEl = fixture.nativeElement.querySelector('.text-rose-500');
    expect(trendEl).toBeTruthy();
    expect(trendEl.textContent).toContain('-5%');
  });

  it('should display zero trend with gray class', () => {
    component.trend = 0;
    fixture.detectChanges();
    
    const trendEl = fixture.nativeElement.querySelector('.text-gray-500');
    expect(trendEl).toBeTruthy();
    expect(trendEl.textContent).toContain('0%');
  });

  it('should not display trend if trend is undefined', () => {
    component.trend = undefined;
    fixture.detectChanges();
    
    const trendEls = fixture.nativeElement.querySelectorAll('.text-emerald-500, .text-rose-500, .text-gray-500');
    expect(trendEls.length).toBe(0);
  });
});
