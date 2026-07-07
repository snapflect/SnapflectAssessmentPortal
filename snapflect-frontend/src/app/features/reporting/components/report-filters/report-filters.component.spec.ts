import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportFiltersComponent } from './report-filters.component';

describe('ReportFiltersComponent', () => {
  let component: ReportFiltersComponent;
  let fixture: ComponentFixture<ReportFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFiltersComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ReportFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty default values', () => {
    expect(component.availableStatuses).toEqual([]);
    expect(component.selectedStatus).toBe('');
    expect(component.searchQuery).toBe('');
  });

  it('should accept inputs', () => {
    component.availableStatuses = ['Active', 'Inactive'];
    component.selectedStatus = 'Active';
    component.searchQuery = 'test';
    fixture.detectChanges();
    
    expect(component.availableStatuses).toEqual(['Active', 'Inactive']);
    expect(component.selectedStatus).toBe('Active');
    expect(component.searchQuery).toBe('test');
  });

  it('should emit filtersChange when status changes', () => {
    spyOn(component.filtersChange, 'emit');
    component.searchQuery = 'test';
    
    component.onStatusChange('Active');
    
    expect(component.selectedStatus).toBe('Active');
    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      status: 'Active',
      search: 'test'
    });
  });

  it('should emit filtersChange when search query changes', () => {
    spyOn(component.filtersChange, 'emit');
    component.selectedStatus = 'Inactive';
    
    component.onSearchChange('new search');
    
    expect(component.searchQuery).toBe('new search');
    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      status: 'Inactive',
      search: 'new search'
    });
  });
});
