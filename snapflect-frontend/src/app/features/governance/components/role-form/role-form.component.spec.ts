import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RoleFormComponent } from './role-form.component';

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFormComponent, ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    
    (component as any).form = fb.group({
      name: ['', Validators.required],
      description: [''],
      permissions: fb.array([])
    });
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form initialized with FormBuilder bindings', () => {
    const form: FormGroup = (component as any).form;
    expect(form).toBeTruthy();
    expect(form.contains('name')).toBeTrue();
    expect(form.contains('description')).toBeTrue();
    expect(form.contains('permissions')).toBeTrue();
  });

  it('should require the name field', () => {
    const form: FormGroup = (component as any).form;
    const nameControl = form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalse();

    nameControl?.setValue('Admin');
    expect(nameControl?.valid).toBeTrue();
  });

  it('should handle permissions form array correctly', () => {
    const form: FormGroup = (component as any).form;
    const permissionsArray = form.get('permissions') as FormArray;
    
    expect(permissionsArray.length).toBe(0);
    
    permissionsArray.push(fb.control('READ_USERS'));
    permissionsArray.push(fb.control('WRITE_USERS'));
    
    expect(permissionsArray.length).toBe(2);
    expect(permissionsArray.at(0).value).toBe('READ_USERS');
    expect(permissionsArray.at(1).value).toBe('WRITE_USERS');
  });

  it('should be valid with valid bindings', () => {
    const form: FormGroup = (component as any).form;
    form.patchValue({
      name: 'Manager',
      description: 'Department Manager'
    });
    expect(form.valid).toBeTrue();
  });
});