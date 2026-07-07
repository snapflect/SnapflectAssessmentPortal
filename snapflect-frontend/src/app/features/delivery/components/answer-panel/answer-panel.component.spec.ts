import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerPanelComponent } from './answer-panel.component';
import { DeliveryFacade } from '../../facades/delivery.facade';

describe('AnswerPanelComponent', () => {
  let component: AnswerPanelComponent;
  let fixture: ComponentFixture<AnswerPanelComponent>;
  let assessmentRunnerSpy: jasmine.SpyObj<DeliveryFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DeliveryFacade', ['saveAnswer']);

    await TestBed.configureTestingModule({
      imports: [AnswerPanelComponent],
      providers: [
        { provide: DeliveryFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerPanelComponent);
    component = fixture.componentInstance;
    assessmentRunnerSpy = TestBed.inject(DeliveryFacade) as jasmine.SpyObj<DeliveryFacade>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
