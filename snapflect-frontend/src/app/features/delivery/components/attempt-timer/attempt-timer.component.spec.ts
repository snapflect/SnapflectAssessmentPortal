import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttemptTimerComponent } from './attempt-timer.component';
import { DeliveryFacade } from '../../facades/delivery.facade';

describe('AttemptTimerComponent', () => {
  let component: AttemptTimerComponent;
  let fixture: ComponentFixture<AttemptTimerComponent>;
  let assessmentRunnerSpy: jasmine.SpyObj<DeliveryFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DeliveryFacade', [], {
      timeRemainingSeconds: jasmine.createSpy().and.returnValue(100)
    });

    await TestBed.configureTestingModule({
      imports: [AttemptTimerComponent],
      providers: [
        { provide: DeliveryFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttemptTimerComponent);
    component = fixture.componentInstance;
    assessmentRunnerSpy = TestBed.inject(DeliveryFacade) as jasmine.SpyObj<DeliveryFacade>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
