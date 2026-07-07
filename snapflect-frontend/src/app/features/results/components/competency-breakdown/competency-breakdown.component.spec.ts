import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetencyBreakdownComponent } from './competency-breakdown.component';

describe('CompetencyBreakdownComponent', () => {
  let component: CompetencyBreakdownComponent;
  let fixture: ComponentFixture<CompetencyBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetencyBreakdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetencyBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
