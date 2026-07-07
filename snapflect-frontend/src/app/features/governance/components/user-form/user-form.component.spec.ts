import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    
    (component as any).form = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role_id: ['', Validators.required],
      department_id: ['', Validators.required]
    });
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form initialized via FormBuilder', () => {
    const form: FormGroup = (component as any).form;
    expect(form).toBeTruthy();
    expect(form.contains('firstName')).toBeTrue();
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('role_id')).toBeTrue();
  });

  it('should enforce email validation on the email binding', () => {
    const form: FormGroup = (component as any).form;
    const emailControl = form.get('email');
    
    emailControl?.setValue('invalidemail');
    expect(emailControl?.valid).toBeFalse();
    
    emailControl?.setValue('user@example.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should require first name, last name, role, and department', () => {
    const form: FormGroup = (component as any).form;
    expect(form.valid).toBeFalse();
    
    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role_id: '10',
      department_id: '20'
    });
    
    expect(form.valid).toBeTrue();
  });
});