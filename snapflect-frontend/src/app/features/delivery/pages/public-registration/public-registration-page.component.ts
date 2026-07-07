import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthStore } from '../../../../shared/stores/auth.store';
import { UserStore } from '../../../../shared/stores/user.store';

@Component({
  selector: 'app-public-registration-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        <!-- Background Effects -->
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-brand/20 rounded-full blur-[80px]"></div>
        <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>

        <div class="relative z-10 text-center mb-8">
          <div class="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h2 class="text-2xl font-bold text-main">Candidate Registration</h2>
          <p class="text-sm text-muted mt-2">Register to take the assessment (Code: <span class="font-mono text-brand">{{ publicationCode }}</span>)</p>
        </div>

        <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 relative z-10">
          {{ error }}
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="submit()" class="relative z-10 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-main mb-1.5">First Name</label>
              <input type="text" formControlName="first_name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-main text-sm focus:outline-none focus:border-brand transition-colors">
            </div>
            <div>
              <label class="block text-xs font-medium text-main mb-1.5">Last Name</label>
              <input type="text" formControlName="last_name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-main text-sm focus:outline-none focus:border-brand transition-colors">
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-main mb-1.5">Email Address</label>
            <input type="email" formControlName="email" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-main text-sm focus:outline-none focus:border-brand transition-colors" placeholder="you@company.com">
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isSubmitting" class="w-full py-3 px-4 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-all duration-200 mt-6 shadow-[0_0_20px_rgba(var(--color-brand),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-brand),0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
            <span *ngIf="!isSubmitting">Register & Join</span>
            <span *ngIf="isSubmitting" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          </button>
        </form>

      </div>
    </div>
  `
})
export class PublicRegistrationPageComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private userStore = inject(UserStore);

  publicationCode = '';
  isSubmitting = false;
  error = '';

  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    this.publicationCode = this.route.snapshot.paramMap.get('publication_code') || '';
  }

  submit() {
    if (this.registerForm.invalid || !this.publicationCode) return;
    
    this.isSubmitting = true;
    this.error = '';

    const payload = {
      ...this.registerForm.value,
      publication_code: this.publicationCode
    };

    this.http.post<any>(`${environment.apiUrl}/delivery/register`, payload)
      .subscribe({
        next: (res) => {
          if (res.token) {
            this.authStore.setToken(res.token);
            // Optionally store user details
            this.userStore.setProfile(res.user);
          }
          this.router.navigate(['/delivery/dashboard']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
      });
  }
}
