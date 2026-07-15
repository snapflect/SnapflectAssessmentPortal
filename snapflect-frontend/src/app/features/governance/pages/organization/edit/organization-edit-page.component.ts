import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { EofLayoutComponent } from '../../../../../shared/frameworks/eof/components/eof-layout/eof-layout.component';
import { EofCardComponent } from '../../../../../shared/frameworks/eof/components/eof-card/eof-card.component';
import { EofSuccessComponent, QuickAction } from '../../../../../shared/frameworks/eof/components/eof-success/eof-success.component';
import { EofEngineService } from '../../../../../shared/frameworks/eof/services/eof-engine.service';
import { EofWizardConfig } from '../../../../../shared/frameworks/eof/models/eof-config.model';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-organization-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EofLayoutComponent, EofCardComponent, EofSuccessComponent],
  host: { class: 'block h-full' },
  providers: [EofEngineService], // Isolated engine instance for this component
  template: `
    <!-- Config Workspace -->
    <app-eof-layout 
      *ngIf="eofConfig && !isSuccess" 
      [config]="eofConfig" 
      [isLoading]="isLoading"
      (close)="onCancel()" 
      (complete)="onComplete($event)">
      
      <ng-container [ngSwitch]="(engine.activeStepIndex$ | async)">
        
        <!-- Step 0: Basic Info -->
        <div *ngSwitchCase="0">
          <app-eof-card 
            title="Organization Profile" 
            description="The core identity of the tenant workspace."
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            [status]="basicForm.valid ? 'valid' : 'pending'">
            <form [formGroup]="basicForm" class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-main mb-2">Workspace Name <span class="text-red-500">*</span></label>
                <input type="text" formControlName="organization_name" placeholder="e.g. Acme Corporation" class="input-field w-full max-w-xl">
              </div>
              <div class="pt-2">
                <label class="block text-sm font-semibold text-main mb-2">Workspace Alias <span class="text-red-500">*</span></label>
                <div class="relative max-w-md">
                  <input type="text" formControlName="organization_code" placeholder="acme" class="input-field w-full pl-4 pr-12">
                  <div class="absolute inset-y-0 right-3 flex items-center" *ngIf="basicForm.value.organization_code">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <!-- Micro-interaction: URL Generation -->
                <div class="mt-3 flex items-start gap-2 bg-brand/5 border border-brand/20 p-3 rounded-lg max-w-xl animate-fade-in-up" *ngIf="basicForm.value.organization_code">
                  <svg class="w-5 h-5 text-brand mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  <div>
                    <p class="text-sm font-semibold text-brand">Workspace URL Generated</p>
                    <p class="text-xs text-muted mt-1 font-mono bg-surface px-2 py-1 rounded mt-2 inline-block border border-border-light text-main">
                      {{ basicForm.value.organization_code | lowercase }}.snapflect.com
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Tenant Type Selection -->
              <div class="pt-6 border-t border-border-light">
                <label class="block text-sm font-semibold text-main mb-3">Tenant Type <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <label class="relative flex cursor-pointer rounded-lg border bg-surface p-4 shadow-sm hover:bg-white/5 transition-colors"
                         [ngClass]="basicForm.value.tenant_type === 'enterprise' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-border-light'">
                    <input type="radio" formControlName="tenant_type" value="enterprise" class="sr-only">
                    <span class="flex flex-1">
                      <span class="flex flex-col">
                        <span class="block text-sm font-medium text-main">Organization</span>
                        <span class="mt-1 flex items-center text-xs text-muted">Direct Client (B2B)</span>
                      </span>
                    </span>
                    <svg class="h-5 w-5 text-brand" *ngIf="basicForm.value.tenant_type === 'enterprise'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </label>
                  
                  <label class="relative flex cursor-pointer rounded-lg border bg-surface p-4 shadow-sm hover:bg-white/5 transition-colors"
                         [ngClass]="basicForm.value.tenant_type === 'partner' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-border-light'">
                    <input type="radio" formControlName="tenant_type" value="partner" class="sr-only">
                    <span class="flex flex-1">
                      <span class="flex flex-col">
                        <span class="block text-sm font-medium text-main">Partner</span>
                        <span class="mt-1 flex items-center text-xs text-muted">Reseller / Agency (B2B2B)</span>
                      </span>
                    </span>
                    <svg class="h-5 w-5 text-brand" *ngIf="basicForm.value.tenant_type === 'partner'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </label>
                </div>
              </div>
            </form>
          </app-eof-card>
        </div>

        <!-- Step 1: Contact -->
        <div *ngSwitchCase="1">
          <app-eof-card 
            title="Primary Contact" 
            description="Who should receive critical platform alerts for this organization?"
            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
            <form [formGroup]="contactForm" class="space-y-8">
              
              <!-- Basic Information -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Account Owner
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Contact Email</label>
                    <input type="email" formControlName="contact_email" placeholder="admin@acme.com" class="input-field w-full">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" formControlName="phone_number" placeholder="+1 (555) 000-0000" class="input-field w-full">
                  </div>
                </div>
              </div>

              <!-- Emergency Contact -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Emergency IT Contact
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">IT Escalation Email</label>
                    <input type="email" formControlName="it_escalation_email" placeholder="it-ops@acme.com" class="input-field w-full">
                  </div>
                </div>
                <p class="text-xs text-muted mt-3">Used only for critical platform outages or security incident reporting.</p>
              </div>

            </form>
          </app-eof-card>
        </div>

        <!-- Step 2: Subscription -->
        <div *ngSwitchCase="2">
          <app-eof-card 
            title="License & Billing" 
            description="Assign a subscription tier to this tenant."
            icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
            <form [formGroup]="subscriptionForm" class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-main mb-2">Plan Tier</label>
                <select formControlName="plan_code" class="input-field w-full max-w-md">
                  <option value="">Select a plan (defaults to 14-Day Free Demo)</option>
                  <option value="DEMO_14">14-Day Free Demo</option>
                  <option value="BASIC_1M">Monthly Basic (₹2,000)</option>
                  <option value="PRO_3M">3-Month Pro (₹5,500)</option>
                  <option value="PRO_6M">6-Month Pro (₹10,000)</option>
                  <option value="ENTERPRISE_12M">Enterprise Annual (₹18,000)</option>
                </select>
              </div>
              <div *ngIf="subscriptionForm.value.plan_code">
                <label class="block text-sm font-semibold text-main mb-2">Payment Reference (Optional)</label>
                <input type="text" formControlName="payment_reference" placeholder="e.g. PO-12345" class="input-field w-full max-w-md">
              </div>
            </form>
          </app-eof-card>
        </div>

        <!-- Step 3: Branding -->
        <div *ngSwitchCase="3">
          <app-eof-card 
            title="Visual Identity" 
            description="Customize the login experience for this tenant's users."
            icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01">
            
            <form [formGroup]="brandingForm" class="space-y-8">
              <!-- Logo Upload -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Workspace Logo
                </h4>
                <div class="flex items-center gap-6">
                  <div class="w-20 h-20 rounded-xl border-2 border-dashed border-border-light flex items-center justify-center bg-surface hover:bg-white/5 cursor-pointer transition-colors" (click)="fileInput.click()">
                    <img *ngIf="brandingForm.value.logo_path" [src]="brandingForm.value.logo_path" class="w-full h-full object-contain rounded-lg">
                    <svg *ngIf="!brandingForm.value.logo_path" class="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-main">Upload a custom logo</p>
                    <p class="text-xs text-muted mt-1">Recommended size: 256x256px. Max 2MB (PNG, JPG, SVG).</p>
                    <input type="file" #fileInput (change)="uploadLogo($event)" class="hidden" accept="image/png, image/jpeg, image/svg+xml">
                    <button type="button" (click)="fileInput.click()" class="mt-3 text-xs font-semibold text-brand hover:text-brand-light">Browse Files</button>
                    <p class="text-xs text-brand mt-1" *ngIf="isUploadingLogo">Uploading...</p>
                  </div>
                </div>
              </div>

              <!-- Brand Colors -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  Brand Colors
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Primary Color (Hex)</label>
                    <div class="flex items-center gap-3">
                      <input type="color" formControlName="primary_color" class="h-10 w-10 rounded cursor-pointer border-0 p-0 bg-transparent">
                      <input type="text" formControlName="primary_color" class="input-field flex-1 font-mono uppercase">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Login Theme</label>
                    <select formControlName="theme_mode" class="input-field w-full">
                      <option value="system">System Default</option>
                      <option value="light">Always Light</option>
                      <option value="dark">Always Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </app-eof-card>
        </div>

        <!-- Step 4: Security -->
        <div *ngSwitchCase="4">
          <app-eof-card 
            title="Access Policies" 
            description="Enforce security minimums for this tenant."
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
            
            <form [formGroup]="securityForm" class="space-y-8">
              <!-- Authentication -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                  Authentication Methods
                </h4>
                
                <div class="space-y-4">
                  <label class="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-border-light bg-surface hover:bg-white/5 transition-colors">
                    <input type="checkbox" formControlName="enforce_mfa" class="mt-1 w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand">
                    <div>
                      <span class="block text-sm font-medium text-main">Enforce Multi-Factor Authentication (MFA)</span>
                      <span class="block text-xs text-muted mt-1">Require all users in this workspace to set up an authenticator app.</span>
                    </div>
                  </label>

                  <label class="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-border-light bg-surface hover:bg-white/5 transition-colors">
                    <input type="checkbox" formControlName="enable_sso" class="mt-1 w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand">
                    <div>
                      <span class="block text-sm font-medium text-main">Enable Enterprise SSO (SAML/OIDC)</span>
                      <span class="block text-xs text-muted mt-1">Allow integration with Azure AD, Okta, or Google Workspace.</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Session Policy -->
              <div class="border-b border-border-light pb-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Session Management
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Idle Timeout</label>
                    <select formControlName="session_timeout" class="input-field w-full">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </app-eof-card>
        </div>

        <!-- Step 5: Users -->
        <div *ngSwitchCase="5">
          <app-eof-card 
            title="Initial Administrators" 
            description="Provision the first client admins who will finish setting up this workspace."
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
            
            <div class="space-y-6">
              <!-- Default Admin Notice -->
              <div class="flex gap-4 p-4 rounded-lg border border-brand/20 bg-brand/5">
                <svg class="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 class="text-sm font-semibold text-main">Account Owner Auto-Provisioned</h4>
                  <p class="text-xs text-muted mt-1">The primary contact <strong>{{ contactForm.value.contact_email || 'assigned in Step 2' }}</strong> will automatically receive the <em>Workspace Administrator</em> role upon activation.</p>
                </div>
              </div>

              <!-- Invite Additional -->
              <div class="border-t border-border-light pt-6">
                <h4 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  Invite Additional Admins (Optional)
                </h4>
                
                <div [formGroup]="usersForm" class="space-y-4">
                  <div formArrayName="users">
                    <div *ngFor="let userCtrl of users.controls; let i = index" [formGroupName]="i" class="flex items-center gap-3">
                      <input type="email" formControlName="email" placeholder="colleague@acme.com" class="input-field flex-1 max-w-md">
                      <select formControlName="role" class="input-field w-40">
                        <option value="admin">Admin</option>
                        <option value="billing">Billing Only</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button type="button" (click)="removeUser(i)" class="p-2 text-muted hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>
                  <button type="button" (click)="addUser()" class="btn-secondary px-4 py-2 rounded-lg text-sm mt-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Invite
                  </button>
                </div>
                
                <p class="text-xs text-muted mt-3">You can manage all users from the Workspace Center after provisioning is complete.</p>
              </div>
            </div>
          </app-eof-card>
        </div>

        <!-- Step 6: Review (Executive Dashboard) -->
        <div *ngSwitchCase="6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-main">Executive Readiness Dashboard</h2>
            <p class="text-sm text-muted mt-1">Review the overall configuration health before provisioning this tenant.</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <!-- Identity -->
            <div class="bg-input-bg border border-border-light rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider">Identity</span>
                <span class="w-2 h-2 rounded-full ring-4" [ngClass]="contactForm.value.contact_email ? 'bg-green-500 ring-green-500/20' : 'bg-red-500 ring-red-500/20'"></span>
              </div>
              <span class="text-sm font-bold text-main">{{ contactForm.value.contact_email ? 'Ready' : 'Incomplete' }}</span>
              <span class="text-xs text-muted mt-1">{{ contactForm.value.contact_email || 'No owner assigned' }}</span>
            </div>

            <!-- Subscription -->
            <div class="bg-input-bg border border-border-light rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider">Plan</span>
                <span class="w-2 h-2 rounded-full ring-4" [ngClass]="subscriptionForm.value.plan_code ? 'bg-green-500 ring-green-500/20' : 'bg-yellow-500 ring-yellow-500/20'"></span>
              </div>
              <span class="text-sm font-bold text-main">{{ subscriptionForm.value.plan_code || 'DEMO_14' }}</span>
              <span class="text-xs text-muted mt-1">Tenant License Selected</span>
            </div>

            <!-- Security -->
            <div class="rounded-xl p-4 flex flex-col justify-between border"
                 [ngClass]="securityForm.value.enforce_mfa ? 'bg-green-500/5 border-green-500/20' : 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider" [ngClass]="securityForm.value.enforce_mfa ? 'text-green-600' : 'text-yellow-600'">Security</span>
                <span class="text-xs font-bold" [ngClass]="securityForm.value.enforce_mfa ? 'text-green-500' : 'text-yellow-500'">{{ securityForm.value.enforce_mfa ? '100%' : '82%' }}</span>
              </div>
              <span class="text-sm font-bold" [ngClass]="securityForm.value.enforce_mfa ? 'text-green-600' : 'text-yellow-600'">{{ securityForm.value.enforce_mfa ? 'Strong' : 'Fair' }}</span>
              <span class="text-xs mt-1" [ngClass]="securityForm.value.enforce_mfa ? 'text-green-600/80' : 'text-yellow-600/80'">
                {{ securityForm.value.enforce_mfa ? 'MFA Enforced' : 'MFA Not Enforced' }}
              </span>
            </div>

            <!-- Branding -->
            <div class="bg-input-bg border border-border-light rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider">Branding</span>
                <span class="w-2 h-2 rounded-full ring-4" [ngClass]="brandingForm.value.logo_path ? 'bg-green-500 ring-green-500/20' : 'bg-yellow-500 ring-yellow-500/20'"></span>
              </div>
              <span class="text-sm font-bold text-main">{{ brandingForm.value.logo_path ? 'Custom' : 'Skipped' }}</span>
              <span class="text-xs text-muted mt-1">{{ brandingForm.value.logo_path ? 'Logo Configured' : 'Using Platform Defaults' }}</span>
            </div>
            
            <!-- Admins -->
            <div class="bg-input-bg border border-border-light rounded-xl p-4 flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-muted uppercase tracking-wider">Admins</span>
                <span class="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-500/20"></span>
              </div>
              <span class="text-sm font-bold text-main">{{ (usersForm.value.users?.length || 0) + (contactForm.value.contact_email ? 1 : 0) }} Assigned</span>
              <span class="text-xs text-muted mt-1">Min. requirement met</span>
            </div>
          </div>

          <app-eof-card 
            title="Recommendations" 
            description="AI-driven suggestions to optimize this tenant's configuration."
            icon="M13 10V3L4 14h7v7l9-11h-7z">
            <div class="flex gap-4 p-3 rounded-lg border border-brand/20 bg-brand/5 mb-3" *ngIf="!securityForm.value.enable_sso">
              <svg class="w-5 h-5 text-brand flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h4 class="text-sm font-semibold text-main">Enable Single Sign-On (SSO)</h4>
                <p class="text-xs text-muted mt-1">Enterprise organizations typically require SAML SSO. Consider configuring it before go-live.</p>
              </div>
            </div>
            <div class="flex gap-4 p-3 rounded-lg border border-border-light bg-surface/30" *ngIf="!brandingForm.value.logo_path">
              <svg class="w-5 h-5 text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <div>
                <h4 class="text-sm font-semibold text-main">Upload a Brand Logo</h4>
                <p class="text-xs text-muted mt-1">White-labeling the login screen increases user trust.</p>
              </div>
            </div>
            <div class="flex gap-4 p-3 rounded-lg border border-green-500/20 bg-green-500/5 mb-3" *ngIf="securityForm.value.enable_sso && brandingForm.value.logo_path">
              <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <div>
                <h4 class="text-sm font-semibold text-main">Fully Optimized!</h4>
                <p class="text-xs text-muted mt-1">You've implemented all our automated recommendations.</p>
              </div>
            </div>
          </app-eof-card>

        </div>

      </ng-container>
    </app-eof-layout>

    <!-- Success Experience -->
    <app-eof-success
      *ngIf="isSuccess"
      headerTitle="🎉 Workspace Updated"
      description="{{ basicForm.value.organization_name }} has been updated successfully. Configuration changes are now live."
      [readinessScore]="(engine.config$ | async)?.steps?.[0]?.status === 'valid' ? 100 : 14"
      [quickActions]="successActions"
      (actionClicked)="handleQuickAction($event)"
      (done)="onCancel()">
    </app-eof-success>
  `
})
export class OrganizationEditPageComponent implements OnInit {
  public engine = inject(EofEngineService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  uuid: string | null = null;
  eofConfig!: EofWizardConfig;
  isSuccess: boolean = false;
  isLoading: boolean = false;
  isUploadingLogo: boolean = false;

  successActions: QuickAction[] = [
    { id: 'invite', label: 'Invite Users', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', description: 'Provision additional client admins.' },
    { id: 'sso', label: 'Configure SSO', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', description: 'Set up SAML for enterprise identity.' },
    { id: 'brand', label: 'Set Branding', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', description: 'Upload tenant logo and colors.' }
  ];

  basicForm: FormGroup;
  contactForm: FormGroup;
  subscriptionForm: FormGroup;
  brandingForm: FormGroup;
  securityForm: FormGroup;
  usersForm: FormGroup;

  constructor() {
    this.basicForm = this.fb.group({
      organization_code: ['', Validators.required],
      organization_name: ['', Validators.required],
      tenant_type: ['enterprise', Validators.required]
    });
    this.contactForm = this.fb.group({
      contact_email: ['', Validators.email],
      phone_number: [''],
      it_escalation_email: ['', Validators.email]
    });
    this.subscriptionForm = this.fb.group({
      plan_code: [''],
      payment_reference: ['']
    });
    this.brandingForm = this.fb.group({
      primary_color: ['#093F...'],
      theme_mode: ['system'],
      logo_path: ['']
    });
    this.securityForm = this.fb.group({
      enforce_mfa: [false],
      enable_sso: [false],
      session_timeout: ['30']
    });
    this.usersForm = this.fb.group({
      users: this.fb.array([])
    });
  }

  get users() {
    return this.usersForm.get('users') as FormArray;
  }

  addUser() {
    this.users.push(this.fb.group({
      email: ['', Validators.email],
      role: ['admin']
    }));
  }

  removeUser(index: number) {
    this.users.removeAt(index);
  }

  ngOnInit() {
    this.eofConfig = {
      wizardId: 'org_edit_v1',
      entityType: 'organization',
      title: 'Configure Workspace',
      description: 'Update tenant identity, security, and billing settings.',
      initialState: 'activated',
      steps: [
        {
          id: 'basic',
          displayName: 'Basic',
          order: 1,
          isRequired: true,
          status: 'pending',
          validationRules: [
            { id: 'code_valid', description: 'Organization Code required', status: 'invalid', isBlocking: true },
            { id: 'name_valid', description: 'Organization Name required', status: 'invalid', isBlocking: true }
          ]
        },
        {
          id: 'contact',
          displayName: 'Contact',
          order: 2,
          isRequired: false,
          status: 'pending',
          validationRules: []
        },
        {
          id: 'subscription',
          displayName: 'Subscription',
          order: 3,
          isRequired: false,
          status: 'pending',
          validationRules: []
        },
        { id: 'branding', displayName: 'Branding', order: 4, isRequired: false, status: 'pending', validationRules: [] },
        { id: 'security', displayName: 'Security', order: 5, isRequired: false, status: 'pending', validationRules: [] },
        { id: 'users', displayName: 'Users', order: 6, isRequired: false, status: 'pending', validationRules: [] },
        { id: 'review', displayName: 'Review', order: 7, isRequired: false, status: 'pending', validationRules: [] },
      ]
    };

    this.basicForm.valueChanges.subscribe(val => {
      const codeCtrl = this.basicForm.get('organization_code');
      const nameCtrl = this.basicForm.get('organization_name');
      const isCodeValid = codeCtrl?.valid || codeCtrl?.disabled;
      const isNameValid = nameCtrl?.valid || nameCtrl?.disabled;
      
      this.engine.updateStepValidation('basic', this.basicForm.valid ? 'valid' : 'invalid', [
        { id: 'code_valid', description: 'Organization Code required', status: isCodeValid ? 'valid' : 'invalid', isBlocking: true },
        { id: 'name_valid', description: 'Organization Name required', status: isNameValid ? 'valid' : 'invalid', isBlocking: true }
      ]);
      this.engine.updateEntityData({ ...val });
    });

    this.contactForm.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('contact', this.contactForm.valid ? 'valid' : 'warning', []);
      this.engine.updateEntityData({ ...val });
    });

    this.subscriptionForm.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('subscription', 'valid', []);
      this.engine.updateEntityData({ ...val });
    });

    this.brandingForm.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('branding', 'valid', []);
      this.engine.updateEntityData({ ...val });
    });

    this.securityForm.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('security', 'valid', []);
      this.engine.updateEntityData({ ...val });
    });

    this.usersForm.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('users', 'valid', []);
      this.engine.updateEntityData({ users: val.users });
    });

    this.route.paramMap.subscribe(params => {
      this.uuid = params.get('uuid');
      if (this.uuid) {
        this.fetchOrganization(this.uuid);
      }
    });
  }

  fetchOrganization(uuid: string) {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:8000/api/v1/governance/organizations/${uuid}`).subscribe({
      next: (res) => {
        const org = res.data ? res.data : res;
        this.basicForm.patchValue({
          organization_code: org.attributes.organization_code,
          organization_name: org.attributes.organization_name,
          tenant_type: org.attributes.tenant_type || 'enterprise'
        });
        // Restrict changing code on edit
        this.basicForm.get('organization_code')?.disable();
        
        this.contactForm.patchValue({
          contact_email: org.attributes.contact_email,
          phone_number: org.attributes.phone_number,
          it_escalation_email: org.attributes.it_escalation_email
        });

        this.brandingForm.patchValue({
          primary_color: org.attributes.primary_color || '#093F...',
          theme_mode: org.attributes.theme_mode || 'system',
          logo_path: org.attributes.logo_path || ''
        });

        this.securityForm.patchValue({
          enforce_mfa: org.attributes.enforce_mfa || false,
          enable_sso: org.attributes.enable_sso || false,
          session_timeout: org.attributes.session_timeout || '30'
        });

        const currentSubscription = org.attributes.current_subscription;
        if (currentSubscription) {
          this.subscriptionForm.patchValue({
             plan_code: currentSubscription.plan_code || '',
             payment_reference: currentSubscription.payment_reference || ''
          });
        }

        if (org.attributes.pending_invites && Array.isArray(org.attributes.pending_invites)) {
          this.users.clear();
          org.attributes.pending_invites.forEach((user: any) => {
            this.users.push(this.fb.group({
              email: [user.email, Validators.email],
              role: [user.role || 'admin']
            }));
          });
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching org:', err);
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/governance/organizations']);
  }

  onComplete(data: any) {
    if (!this.uuid) return;

    const finalData = {
      ...this.basicForm.value,
      ...this.contactForm.value,
      ...this.brandingForm.value,
      ...this.securityForm.value,
      ...this.subscriptionForm.value,
      users: this.usersForm.value.users
    };

    if (!finalData.plan_code) finalData.plan_code = null;

    this.isLoading = true;
    this.http.put(`http://localhost:8000/api/v1/governance/organizations/${this.uuid}`, finalData)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to update organization', err);
          let errorMessage = err.message;
          const details = err.error?.errors || err.error?.detail;
          if (err.status === 422 && details) {
            const firstKey = Object.keys(details)[0];
            errorMessage = details[firstKey][0];
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.title) {
            errorMessage = err.error.title;
          }
          this.toastService.error('Update Failed', errorMessage);
        }
      });
  }

  uploadLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingLogo = true;
      const formData = new FormData();
      formData.append('logo', file);
      
      this.http.post<any>('http://localhost:8000/api/v1/governance/organizations/upload-logo', formData)
        .subscribe({
          next: (res) => {
            if (res.data && res.data.logo_path) {
              this.brandingForm.patchValue({ logo_path: 'http://localhost:8000' + res.data.logo_path });
            }
            this.isUploadingLogo = false;
          },
          error: (err) => {
            console.error('Logo upload failed', err);
            this.isUploadingLogo = false;
          }
        });
    }
  }

  handleQuickAction(actionId: string) {
    console.log('Quick action triggered:', actionId);
    // In a real app, this would route to specific sub-modules or open modals
    this.onCancel();
  }
}