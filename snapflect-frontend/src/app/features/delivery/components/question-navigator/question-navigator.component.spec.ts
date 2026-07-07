import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionNavigatorComponent } from './question-navigator.component';
import { DeliveryFacade } from '../../facades/delivery.facade';

describe('QuestionNavigatorComponent', () => {
  let component: QuestionNavigatorComponent;
  let fixture: ComponentFixture<QuestionNavigatorComponent>;
  let assessmentRunnerSpy: jasmine.SpyObj<DeliveryFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DeliveryFacade', ['navigateQuestion']);

    await TestBed.configureTestingModule({
      imports: [QuestionNavigatorComponent],
      providers: [
        { provide: DeliveryFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionNavigatorComponent);
    component = fixture.componentInstance;
    assessmentRunnerSpy = TestBed.inject(DeliveryFacade) as jasmine.SpyObj<DeliveryFacade>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
