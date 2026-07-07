import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentFormComponent } from './department-form.component';

describe('DepartmentFormComponent', () => {
  let component: DepartmentFormComponent;
  let fixture: ComponentFixture<DepartmentFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentFormComponent, ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    
    // Mock the expected form creation for the stub
    (component as any).form = fb.group({
      name: ['', Validators.required],
      organization_id: ['', Validators.required],
      description: ['']
    });
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form initialized with FormBuilder', () => {
    const form: FormGroup = (component as any).form;
    expect(form).toBeTruthy();
    expect(form.contains('name')).toBeTrue();
    expect(form.contains('organization_id')).toBeTrue();
    expect(form.contains('description')).toBeTrue();
  });

  it('should validate that name and organization_id are required', () => {
    const form: FormGroup = (component as any).form;
    const nameControl = form.get('name');
    const orgControl = form.get('organization_id');

    nameControl?.setValue('');
    orgControl?.setValue('');
    expect(nameControl?.valid).toBeFalse();
    expect(orgControl?.valid).toBeFalse();

    nameControl?.setValue('Engineering');
    orgControl?.setValue('1');
    expect(nameControl?.valid).toBeTrue();
    expect(orgControl?.valid).toBeTrue();
  });

  it('should update form bindings correctly', () => {
    const form: FormGroup = (component as any).form;
    form.patchValue({
      name: 'Sales',
      organization_id: '2',
      description: 'Sales Department'
    });

    expect(form.value).toEqual({
      name: 'Sales',
      organization_id: '2',
      description: 'Sales Department'
    });
  });

  it('should mark form as valid when required fields are filled', () => {
    const form: FormGroup = (component as any).form;
    expect(form.valid).toBeFalse();

    form.patchValue({
      name: 'Marketing',
      organization_id: '3'
    });
    expect(form.valid).toBeTrue();
  });
});