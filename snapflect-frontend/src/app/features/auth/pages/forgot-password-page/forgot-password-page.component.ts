import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ForgotPasswordFormComponent],
  template: '<app-forgot-password-form></app-forgot-password-form>'
})
export class ForgotPasswordPageComponent {}