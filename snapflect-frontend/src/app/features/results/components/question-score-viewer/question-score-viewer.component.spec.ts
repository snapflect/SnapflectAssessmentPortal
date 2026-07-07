import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionScoreViewerComponent } from './question-score-viewer.component';

describe('QuestionScoreViewerComponent', () => {
  let component: QuestionScoreViewerComponent;
  let fixture: ComponentFixture<QuestionScoreViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionScoreViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionScoreViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
