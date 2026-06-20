import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResetPasswordFormComponent } from '../../components/reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ResetPasswordFormComponent],
  template: '<app-reset-password-form></app-reset-password-form>'
})
export class ResetPasswordPageComponent {}