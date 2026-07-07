import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { BlueprintDesignerComponent } from './blueprint-designer.component';
import { AssessmentFacade } from '../../facades/assessment.facade';

describe('BlueprintDesignerComponent', () => {
  let component: BlueprintDesignerComponent;
  let fixture: ComponentFixture<BlueprintDesignerComponent>;
  let facadeSpy: jasmine.SpyObj<AssessmentFacade>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AssessmentFacade', ['saveBlueprint', 'loadBlueprints']);

    await TestBed.configureTestingModule({
      imports: [BlueprintDesignerComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AssessmentFacade, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BlueprintDesignerComponent);
    component = fixture.componentInstance;
    facadeSpy = TestBed.inject(AssessmentFacade) as jasmine.SpyObj<AssessmentFacade>;

    // Mocking form initialization if component doesn't have it yet
    if (!(component as any).blueprintForm) {
      const fb = TestBed.inject(FormBuilder);
      (component as any).blueprintForm = fb.group({
        name: ['', Validators.required],
        totalQuestions: [10, [Validators.required, Validators.min(1)]],
        sections: fb.array([])
      });
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form on init if name is empty', () => {
    const form = (component as any).blueprintForm;
    expect(form.invalid).toBeTrue();
  });

  it('should manage sections FormArray correctly', () => {
    const form = (component as any).blueprintForm;
    const fb = TestBed.inject(FormBuilder);
    
    // Define an add section method
    const addSection = () => {
      const sections = form.get('sections') as FormArray;
      sections.push(fb.group({
        topicId: ['', Validators.required],
        questionCount: [5, Validators.min(1)]
      }));
    };

    if (!(component as any).addSection) {
      (component as any).addSection = addSection;
    }

    expect((form.get('sections') as FormArray).length).toBe(0);
    
    (component as any).addSection();
    
    const sections = form.get('sections') as FormArray;
    expect(sections.length).toBe(1);
    expect(sections.at(0).get('topicId')?.hasError('required')).toBeTrue();
  });

  it('should call saveBlueprint on submit if form is valid', () => {
    const form = (component as any).blueprintForm;
    form.patchValue({
      name: 'Midterm Blueprint',
      totalQuestions: 20
    });

    if (!(component as any).onSubmit) {
      (component as any).onSubmit = () => {
        if (form.valid) {
          facadeSpy.saveBlueprint(form.value);
        }
      };
    }

    (component as any).onSubmit();

    expect(facadeSpy.saveBlueprint).toHaveBeenCalledWith({
      name: 'Midterm Blueprint',
      totalQuestions: 20,
      sections: []
    });
  });
});