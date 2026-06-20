import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordFormComponent } from '../../components/change-password-form/change-password-form.component';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, ChangePasswordFormComponent],
  template: '<app-change-password-form></app-change-password-form>'
})
export class ChangePasswordPageComponent {}