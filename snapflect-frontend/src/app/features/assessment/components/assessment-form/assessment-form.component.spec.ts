import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentFormComponent } from './assessment-form.component';
import { UserStore } from '../../../../shared/stores/user.store';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('AssessmentFormComponent', () => {
  let component: AssessmentFormComponent;
  let fixture: ComponentFixture<AssessmentFormComponent>;
  let mockUserStore: jasmine.SpyObj<UserStore>;

  beforeEach(async () => {
    mockUserStore = jasmine.createSpyObj('UserStore', ['hasAnyRole', 'hasAnyPermission']);

    await TestBed.configureTestingModule({
      imports: [AssessmentFormComponent, ReactiveFormsModule],
      providers: [
        { provide: UserStore, useValue: mockUserStore }
      ]
    }).compileComponents();
  });

  const createComponent = (roles: string[]) => {
    mockUserStore.hasAnyRole.and.callFake((requiredRoles: string[]) => {
      return requiredRoles.some(role => roles.includes(role));
    });
    fixture = TestBed.createComponent(AssessmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('READ_ONLY Persona', () => {
    beforeEach(() => {
      createComponent(['READ_ONLY']);
    });

    it('should disable the form', () => {
      expect(component.assessmentForm.disabled).toBeTrue();
    });

    it('should hide submit, edit, and delete buttons', () => {
      const submitBtn = fixture.debugElement.query(By.css('#submit-btn'));
      const editBtn = fixture.debugElement.query(By.css('#edit-btn'));
      const deleteBtn = fixture.debugElement.query(By.css('#delete-btn'));

      expect(submitBtn).toBeNull();
      expect(editBtn).toBeNull();
      expect(deleteBtn).toBeNull();
    });
  });

  describe('PLATFORM_ADMIN Persona', () => {
    beforeEach(() => {
      createComponent(['PLATFORM_ADMIN']);
    });

    it('should enable the form', () => {
      expect(component.assessmentForm.enabled).toBeTrue();
    });

    it('should show submit, edit, and delete buttons', () => {
      const submitBtn = fixture.debugElement.query(By.css('#submit-btn'));
      const editBtn = fixture.debugElement.query(By.css('#edit-btn'));
      const deleteBtn = fixture.debugElement.query(By.css('#delete-btn'));

      expect(submitBtn).toBeTruthy();
      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeTruthy();
    });

    it('should submit form successfully when valid', () => {
      component.assessmentForm.patchValue({ name: 'Test Assessment', description: 'Test Desc' });
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();

      expect(component.submitSuccess).toBeTrue();
      const successMsg = fixture.debugElement.query(By.css('#success-msg'));
      expect(successMsg).toBeTruthy();
      expect(successMsg.nativeElement.textContent).toContain('Assessment saved successfully!');
    });

    it('should not submit form when invalid', () => {
      component.assessmentForm.patchValue({ name: '', description: 'Test Desc' });
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();

      expect(component.submitSuccess).toBeFalse();
    });
    
    it('should show error message when name is invalid and touched', () => {
      const nameInput = component.assessmentForm.get('name');
      nameInput?.markAsTouched();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('.error-msg'));
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.nativeElement.textContent.trim()).toBe('Name is required');
    });
  });

  describe('CLIENT_ADMIN Persona', () => {
    beforeEach(() => {
      createComponent(['CLIENT_ADMIN']);
    });

    it('should enable the form', () => {
      expect(component.assessmentForm.enabled).toBeTrue();
    });

    it('should show submit, edit, and delete buttons', () => {
      const submitBtn = fixture.debugElement.query(By.css('#submit-btn'));
      const editBtn = fixture.debugElement.query(By.css('#edit-btn'));
      const deleteBtn = fixture.debugElement.query(By.css('#delete-btn'));

      expect(submitBtn).toBeTruthy();
      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeTruthy();
    });
  });

  describe('ASSESSMENT_MANAGER Persona', () => {
    beforeEach(() => {
      createComponent(['ASSESSMENT_MANAGER']);
    });

    it('should enable the form', () => {
      expect(component.assessmentForm.enabled).toBeTrue();
    });

    it('should show submit and edit buttons but hide delete button', () => {
      const submitBtn = fixture.debugElement.query(By.css('#submit-btn'));
      const editBtn = fixture.debugElement.query(By.css('#edit-btn'));
      const deleteBtn = fixture.debugElement.query(By.css('#delete-btn'));

      expect(submitBtn).toBeTruthy();
      expect(editBtn).toBeTruthy();
      expect(deleteBtn).toBeNull();
    });
  });

});