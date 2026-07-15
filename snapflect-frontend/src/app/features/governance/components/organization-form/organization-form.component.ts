import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-6 text-gray-900">Provision New Organization (Tenant)</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>This will dynamically spin up an isolated database for the client.</p>
        </div>
        <form [formGroup]="orgForm" (ngSubmit)="onSubmit()" class="mt-5 sm:flex sm:items-center flex-col gap-4 w-full">
          
          <div class="w-full">
            <label for="organization_name" class="block text-sm font-medium leading-6 text-gray-900">Organization Name</label>
            <div class="mt-2">
              <input type="text" formControlName="organization_name" id="organization_name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div class="w-full">
            <label for="legal_name" class="block text-sm font-medium leading-6 text-gray-900">Legal Name</label>
            <div class="mt-2">
              <input type="text" formControlName="legal_name" id="legal_name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div class="w-full">
            <label for="organization_code" class="block text-sm font-medium leading-6 text-gray-900">Organization Code (Tenant ID / Subdomain)</label>
            <div class="mt-2">
              <input type="text" formControlName="organization_code" id="organization_code" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div class="w-full">
            <label for="contact_email" class="block text-sm font-medium leading-6 text-gray-900">Initial Client Admin Email</label>
            <div class="mt-2">
              <input type="email" formControlName="contact_email" id="contact_email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div class="w-full">
            <label for="country" class="block text-sm font-medium leading-6 text-gray-900">Country Code</label>
            <div class="mt-2">
              <input type="text" formControlName="country" id="country" placeholder="e.g. US, UK, IN" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div class="w-full mt-4 flex justify-end">
            <button type="submit" [disabled]="orgForm.invalid || isSubmitting" class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50">
              <span *ngIf="!isSubmitting">Provision Organization</span>
              <span *ngIf="isSubmitting">Provisioning...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OrganizationFormComponent {
  @Input() isSubmitting = false;
  @Output() save = new EventEmitter<any>();

  orgForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.orgForm = this.fb.group({
      organization_code: ['', Validators.required],
      organization_name: ['', Validators.required],
      legal_name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      country: ['US', Validators.required],
      timezone: ['UTC', Validators.required],
      status: ['ACTIVE']
    });
  }

  onSubmit() {
    if (this.orgForm.valid) {
      this.save.emit(this.orgForm.value);
    }
  }
}