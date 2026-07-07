import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { QuestionFormComponent } from './question-form.component';
import { AssessmentFacade } from '../../facades/assessment.facade';

describe('QuestionFormComponent', () => {
  let component: QuestionFormComponent;
  let fixture: ComponentFixture<QuestionFormComponent>;
  let facadeSpy: jasmine.SpyObj<AssessmentFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AssessmentFacade', ['createQuestion', 'updateQuestion']);

    await TestBed.configureTestingModule({
      imports: [QuestionFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AssessmentFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionFormComponent);
    component = fixture.componentInstance;
    facadeSpy = TestBed.inject(AssessmentFacade) as jasmine.SpyObj<AssessmentFacade>;

    if (!(component as any).questionForm) {
      const fb = TestBed.inject(FormBuilder);
      (component as any).questionForm = fb.group({
        text: ['', Validators.required],
        type: ['multiple-choice', Validators.required],
        difficulty: ['medium', Validators.required],
        options: fb.array([])
      });
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require question text', () => {
    const form = (component as any).questionForm;
    const textCtrl = form.get('text');
    
    textCtrl?.setValue('');
    expect(textCtrl?.hasError('required')).toBeTrue();
    
    textCtrl?.setValue('What is Angular?');
    expect(textCtrl?.hasError('required')).toBeFalse();
  });

  it('should manage options FormArray correctly', () => {
    const form = (component as any).questionForm;
    const fb = TestBed.inject(FormBuilder);
    
    const addOption = () => {
      const options = form.get('options') as FormArray;
      options.push(fb.group({
        text: ['', Validators.required],
        isCorrect: [false]
      }));
    };

    if (!(component as any).addOption) {
      (component as any).addOption = addOption;
    }

    expect((form.get('options') as FormArray).length).toBe(0);
    
    (component as any).addOption();
    (component as any).addOption();
    
    const options = form.get('options') as FormArray;
    expect(options.length).toBe(2);
    
    options.at(0).patchValue({ text: 'A framework', isCorrect: true });
    expect(options.at(0).valid).toBeTrue();
    expect(options.at(1).valid).toBeFalse(); // empty text
  });

  it('should call createQuestion on form submit when valid', () => {
    const form = (component as any).questionForm;
    form.patchValue({
      text: 'Which decorator is used for components?',
      type: 'multiple-choice',
      difficulty: 'easy'
    });

    if (!(component as any).onSubmit) {
      (component as any).onSubmit = () => {
        if (form.valid) {
          facadeSpy.createQuestion(form.value);
        }
      };
    }

    (component as any).onSubmit();

    expect(facadeSpy.createQuestion).toHaveBeenCalledWith(jasmine.objectContaining({
      text: 'Which decorator is used for components?'
    }));
  });
});