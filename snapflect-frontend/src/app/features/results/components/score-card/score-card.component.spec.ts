import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreCardComponent } from './score-card.component';
import { By } from '@angular/platform-browser';

describe('ScoreCardComponent', () => {
  let component: ScoreCardComponent;
  let fixture: ComponentFixture<ScoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage correctly', () => {
    component.score = 50;
    component.total = 100;
    expect(component.getPercentage()).toBe(50);
    
    component.score = 75;
    component.total = 150;
    expect(component.getPercentage()).toBe(50);
  });

  it('should return 0 percentage if score is undefined or total is 0', () => {
    component.score = undefined;
    expect(component.getPercentage()).toBe(0);

    component.score = 50;
    component.total = 0;
    expect(component.getPercentage()).toBe(0);
  });

  it('should render label and score if provided', () => {
    component.label = 'Test Score';
    component.score = 80;
    component.total = 100;
    fixture.detectChanges();

    const h3 = fixture.debugElement.query(By.css('h3')).nativeElement;
    expect(h3.textContent).toContain('Test Score');

    const scoreValue = fixture.debugElement.query(By.css('.score-value')).nativeElement;
    expect(scoreValue.textContent).toContain('80 / 100');
  });

  it('should render chart and progress bar if showChart is true', () => {
    component.showChart = true;
    component.score = 40;
    component.total = 100;
    fixture.detectChanges();

    const progressBar = fixture.debugElement.query(By.css('.progress-bar')).nativeElement;
    expect(progressBar.style.width).toBe('40%');
  });

  it('should not render chart if showChart is false', () => {
    component.showChart = false;
    fixture.detectChanges();

    const chartContainer = fixture.debugElement.query(By.css('.chart-container'));
    expect(chartContainer).toBeNull();
  });
});
