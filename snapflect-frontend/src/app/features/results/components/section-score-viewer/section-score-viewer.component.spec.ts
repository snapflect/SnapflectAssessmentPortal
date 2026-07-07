import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionScoreViewerComponent } from './section-score-viewer.component';

describe('SectionScoreViewerComponent', () => {
  let component: SectionScoreViewerComponent;
  let fixture: ComponentFixture<SectionScoreViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionScoreViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionScoreViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
