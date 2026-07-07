import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionRendererComponent } from './question-renderer.component';
import { DeliveryFacade } from '../../facades/delivery.facade';

describe('QuestionRendererComponent', () => {
  let component: QuestionRendererComponent;
  let fixture: ComponentFixture<QuestionRendererComponent>;
  let assessmentRunnerSpy: jasmine.SpyObj<DeliveryFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DeliveryFacade', ['getQuestion']);

    await TestBed.configureTestingModule({
      imports: [QuestionRendererComponent],
      providers: [
        { provide: DeliveryFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionRendererComponent);
    component = fixture.componentInstance;
    assessmentRunnerSpy = TestBed.inject(DeliveryFacade) as jasmine.SpyObj<DeliveryFacade>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
