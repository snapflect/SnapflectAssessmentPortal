import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportTableComponent } from './report-table.component';

describe('ReportTableComponent', () => {
  let component: ReportTableComponent;
  let fixture: ComponentFixture<ReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTableComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading state', () => {
    component.loading = true;
    component.columns = [{ key: 'id', header: 'ID' }];
    fixture.detectChanges();
    
    const tableEl = fixture.nativeElement.querySelector('table');
    expect(tableEl.textContent).toContain('Loading report data...');
  });

  it('should show empty state when no data and not loading', () => {
    component.loading = false;
    component.data = [];
    component.columns = [{ key: 'id', header: 'ID' }];
    fixture.detectChanges();
    
    const tableEl = fixture.nativeElement.querySelector('table');
    expect(tableEl.textContent).toContain('No data available.');
  });

  it('should render data columns correctly based on types', () => {
    component.loading = false;
    component.columns = [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'score', header: 'Score', type: 'number' },
      { key: 'passRate', header: 'Pass Rate', type: 'percentage' }
    ];
    component.data = [
      { name: 'John', score: 85, passRate: 90 }
    ];
    fixture.detectChanges();
    
    const tableEl = fixture.nativeElement.querySelector('table');
    expect(tableEl.textContent).toContain('John');
    expect(tableEl.textContent).toContain('85');
    expect(tableEl.textContent).toContain('90%');
  });

  it('should align numbers and percentages to the right', () => {
    component.columns = [
      { key: 'name', header: 'Name', type: 'text' },
      { key: 'score', header: 'Score', type: 'number' }
    ];
    component.data = [{ name: 'John', score: 85 }];
    fixture.detectChanges();
    
    const ths = fixture.nativeElement.querySelectorAll('th');
    expect(ths[0].classList).not.toContain('text-right');
    expect(ths[1].classList).toContain('text-right');

    const tds = fixture.nativeElement.querySelectorAll('td');
    expect(tds[0].classList).not.toContain('text-right');
    expect(tds[1].classList).toContain('text-right');
  });
});
