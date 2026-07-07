import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualReviewFormComponent } from './manual-review-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('ManualReviewFormComponent', () => {
  let component: ManualReviewFormComponent;
  let fixture: ComponentFixture<ManualReviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualReviewFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualReviewFormComponent);
    component = fixture.componentInstance;
    component.resultId = 'res-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.reviewForm.valid).toBeFalse();
  });

  it('should validate score min and max', () => {
    const scoreControl = component.reviewForm.get('score');
    scoreControl?.setValue(-5);
    expect(scoreControl?.hasError('min')).toBeTrue();
    
    scoreControl?.setValue(150);
    expect(scoreControl?.hasError('max')).toBeTrue();
    
    scoreControl?.setValue(50);
    expect(scoreControl?.valid).toBeTrue();
  });

  it('should not emit if form is invalid', () => {
    spyOn(component.submitReview, 'emit');
    component.onSubmit();
    expect(component.submitReview.emit).not.toHaveBeenCalled();
  });

  it('should not emit if resultId is missing', () => {
    spyOn(component.submitReview, 'emit');
    component.resultId = undefined;
    component.reviewForm.setValue({ score: 80, feedback: 'Good job' });
    component.onSubmit();
    expect(component.submitReview.emit).not.toHaveBeenCalled();
  });

  it('should emit on valid submit', () => {
    spyOn(component.submitReview, 'emit');
    component.reviewForm.setValue({ score: 85, feedback: 'Excellent' });
    component.onSubmit();
    expect(component.submitReview.emit).toHaveBeenCalledWith({
      resultId: 'res-1',
      score: 85,
      feedback: 'Excellent'
    });
  });

  it('should disable submit button when form is invalid or isSubmitting is true', () => {
    const btn = fixture.debugElement.query(By.css('button')).nativeElement;
    
    expect(btn.disabled).toBeTrue();
    
    component.reviewForm.setValue({ score: 80, feedback: 'Nice' });
    fixture.detectChanges();
    expect(btn.disabled).toBeFalse();
    
    component.isSubmitting = true;
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
    expect(btn.textContent).toContain('Submitting...');
  });
});