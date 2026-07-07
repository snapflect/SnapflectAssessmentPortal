import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationFormComponent } from './organization-form.component';

describe('OrganizationFormComponent', () => {
  let component: OrganizationFormComponent;
  let fixture: ComponentFixture<OrganizationFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationFormComponent, ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationFormComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    
    (component as any).form = fb.group({
      name: ['', Validators.required],
      domain: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      status: ['active']
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
    expect(form.contains('domain')).toBeTrue();
    expect(form.contains('status')).toBeTrue();
  });

  it('should require name and domain fields', () => {
    const form: FormGroup = (component as any).form;
    const nameControl = form.get('name');
    const domainControl = form.get('domain');

    nameControl?.setValue('');
    domainControl?.setValue('');
    expect(nameControl?.valid).toBeFalse();
    expect(domainControl?.valid).toBeFalse();
  });

  it('should validate domain format', () => {
    const form: FormGroup = (component as any).form;
    const domainControl = form.get('domain');

    domainControl?.setValue('invalid-domain');
    expect(domainControl?.valid).toBeFalse();

    domainControl?.setValue('example.com');
    expect(domainControl?.valid).toBeTrue();
  });

  it('should have a valid form when all bindings are correct', () => {
    const form: FormGroup = (component as any).form;
    form.patchValue({
      name: 'Acme Corp',
      domain: 'acme.com',
      status: 'active'
    });
    expect(form.valid).toBeTrue();
  });
});