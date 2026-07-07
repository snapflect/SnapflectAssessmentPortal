import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDateRangeComponent } from './report-date-range.component';

describe('ReportDateRangeComponent', () => {
  let component: ReportDateRangeComponent;
  let fixture: ComponentFixture<ReportDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDateRangeComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null dates by default', () => {
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should accept input dates', () => {
    component.startDate = '2026-07-01';
    component.endDate = '2026-07-31';
    fixture.detectChanges();
    expect(component.startDate).toBe('2026-07-01');
    expect(component.endDate).toBe('2026-07-31');
  });

  it('should emit dateRangeChange when start date changes', () => {
    spyOn(component.dateRangeChange, 'emit');
    component.endDate = '2026-07-31';
    
    component.onStartDateChange('2026-07-01');
    
    expect(component.startDate).toBe('2026-07-01');
    expect(component.dateRangeChange.emit).toHaveBeenCalledWith({
      startDate: '2026-07-01',
      endDate: '2026-07-31'
    });
  });

  it('should emit dateRangeChange when end date changes', () => {
    spyOn(component.dateRangeChange, 'emit');
    component.startDate = '2026-07-01';
    
    component.onEndDateChange('2026-07-31');
    
    expect(component.endDate).toBe('2026-07-31');
    expect(component.dateRangeChange.emit).toHaveBeenCalledWith({
      startDate: '2026-07-01',
      endDate: '2026-07-31'
    });
  });
});
