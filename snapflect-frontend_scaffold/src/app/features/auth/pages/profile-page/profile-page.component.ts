import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ProfileFormComponent],
  template: '<app-profile-form></app-profile-form>'
})
export class ProfilePageComponent {}