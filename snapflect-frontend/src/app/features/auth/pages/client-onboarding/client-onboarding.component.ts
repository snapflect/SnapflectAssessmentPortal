import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EofLayoutComponent } from '../../../../shared/frameworks/eof/components/eof-layout/eof-layout.component';
import { EofEngineService } from '../../../../shared/frameworks/eof/services/eof-engine.service';
import { EofWizardConfig } from '../../../../shared/frameworks/eof/models/eof-config.model';

@Component({
  selector: 'app-client-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EofLayoutComponent],
  host: { class: 'block h-full' },
  template: `
    <app-eof-layout 
      *ngIf="eofConfig" 
      [config]="eofConfig" 
      (close)="onCancel()" 
      (complete)="onComplete($event)">
      
      <!-- EOF engine's active index dictates the step rendered -->
      <ng-container [ngSwitch]="(engine.activeStepIndex$ | async)">
        
        <!-- Step 0: Legal -->
        <div *ngSwitchCase="0">
          <h2 class="text-xl font-bold text-main mb-6">Legal Agreements</h2>
          <div class="bg-surface-dark border border-border-light rounded-lg p-6 h-64 overflow-y-auto text-sm text-muted mb-6">
            <h3 class="font-bold text-main mb-2">Master Service Agreement (MSA)</h3>
            <p class="mb-4">By accessing or using the Snapflect Platform, you agree to be bound by these terms...</p>
            <p>1. Term & Termination</p>
            <p>2. Data Privacy & Security (ISO 27001 Compliant)</p>
            <p>3. Service Level Agreement (99.9% Uptime)</p>
          </div>
          <div class="flex items-center gap-3">
            <input type="checkbox" id="accept_terms" [formControl]="acceptedTermsControl" class="w-5 h-5 rounded border-border-light text-brand focus:ring-brand bg-surface">
            <label for="accept_terms" class="text-sm font-medium text-main">I have read and agree to the Master Service Agreement</label>
          </div>
        </div>

        <!-- Step 1: Branding -->
        <div *ngSwitchCase="1">
          <h2 class="text-xl font-bold text-main mb-6">Brand Identity</h2>
          <form [formGroup]="brandingForm" class="space-y-6">
            <div class="bg-surface-dark border border-border-light rounded-lg p-6">
              <label class="block text-sm font-medium text-main mb-2">Primary Brand Color (Hex)</label>
              <div class="flex items-center gap-4">
                <input type="color" formControlName="primaryColor" class="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-0">
                <input type="text" formControlName="primaryColor" class="input-field max-w-[150px] font-mono">
              </div>
              <p class="text-xs text-muted mt-2">This color will be used for buttons, active states, and email templates.</p>
            </div>
          </form>
        </div>

        <!-- Step 2: Identity (SAML) -->
        <div *ngSwitchCase="2">
          <h2 class="text-xl font-bold text-main mb-2">Identity & Authentication</h2>
          <p class="text-sm text-muted mb-6">Configure Enterprise Single Sign-On (SSO) using SAML 2.0 to allow your employees to authenticate seamlessly.</p>
          
          <form [formGroup]="samlForm" class="space-y-5 bg-surface-dark border border-border-light rounded-lg p-6">
            <div>
              <label class="block text-sm font-medium text-main mb-1.5">IdP Entity ID</label>
              <input type="text" formControlName="idp_entity_id" placeholder="https://sts.windows.net/..." class="input-field w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-main mb-1.5">IdP SSO URL</label>
              <input type="url" formControlName="idp_sso_url" placeholder="https://login.microsoftonline.com/..." class="input-field w-full">
            </div>
            <div>
              <label class="block text-sm font-medium text-main mb-1.5">X.509 Certificate</label>
              <textarea formControlName="idp_x509_cert" rows="4" placeholder="-----BEGIN CERTIFICATE-----..." class="input-field w-full font-mono text-xs"></textarea>
            </div>
          </form>
        </div>

        <!-- Step 3: Data Upload -->
        <div *ngSwitchCase="3">
          <h2 class="text-xl font-bold text-main mb-2">Initial Data Import</h2>
          <p class="text-sm text-muted mb-6">Upload a CSV file containing your organizational structure (Departments, Locations) and employee roster to jumpstart your environment.</p>
          
          <div class="bg-surface-dark border-2 border-dashed border-border-light rounded-lg p-10 text-center hover:border-brand/50 transition-colors">
            <svg class="w-10 h-10 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-sm font-medium text-main mb-1">Click to upload or drag and drop</p>
            <p class="text-xs text-muted mb-4">CSV (max. 10MB)</p>
            <input type="file" (change)="onFileSelected($event)" accept=".csv" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 file:cursor-pointer cursor-pointer">
          </div>
        </div>

      </ng-container>
    </app-eof-layout>
  `
})
export class ClientOnboardingComponent implements OnInit {
  public engine = inject(EofEngineService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  eofConfig!: EofWizardConfig;

  // Form Controls
  acceptedTermsControl = new FormControl(false);
  brandingForm: FormGroup;
  samlForm: FormGroup;
  selectedFile: File | null = null;

  constructor() {
    this.brandingForm = this.fb.group({
      primaryColor: ['#4f46e5']
    });

    this.samlForm = this.fb.group({
      idp_entity_id: [''],
      idp_sso_url: [''],
      idp_x509_cert: ['']
    });
  }

  ngOnInit() {
    this.eofConfig = {
      wizardId: 'org_onboarding_v1',
      entityType: 'organization',
      title: 'Client Onboarding',
      description: 'Configure your new organization environment before activation.',
      initialState: 'in_progress',
      steps: [
        {
          id: 'legal',
          displayName: 'Legal',
          order: 1,
          isRequired: true,
          status: 'pending',
          validationRules: [
            { id: 'msa_accepted', description: 'Master Service Agreement accepted', status: 'invalid', isBlocking: true }
          ]
        },
        {
          id: 'branding',
          displayName: 'Branding',
          order: 2,
          isRequired: false,
          status: 'pending',
          validationRules: [
            { id: 'logo_uploaded', description: 'Upload a custom logo', status: 'warning', isBlocking: false }
          ]
        },
        {
          id: 'sso',
          displayName: 'Identity',
          order: 3,
          isRequired: false,
          status: 'pending',
          validationRules: [
            { id: 'saml_configured', description: 'Configure SAML SSO for enterprise security', status: 'warning', isBlocking: false }
          ]
        },
        {
          id: 'data',
          displayName: 'Data Import',
          order: 4,
          isRequired: false,
          status: 'pending',
          validationRules: []
        }
      ]
    };

    // Watch forms and update engine validation state
    this.acceptedTermsControl.valueChanges.subscribe(val => {
      this.engine.updateStepValidation('legal', val ? 'valid' : 'invalid', [
        { id: 'msa_accepted', description: 'Master Service Agreement accepted', status: val ? 'valid' : 'invalid', isBlocking: true }
      ]);
      this.engine.updateEntityData({ termsAccepted: val });
    });

    this.brandingForm.valueChanges.subscribe(val => {
      this.engine.updateEntityData({ branding: val });
    });

    this.samlForm.valueChanges.subscribe(val => {
      const isValid = this.samlForm.valid && val.idp_entity_id !== '';
      this.engine.updateStepValidation('sso', isValid ? 'valid' : 'pending', [
        { id: 'saml_configured', description: 'Configure SAML SSO for enterprise security', status: isValid ? 'valid' : 'warning', isBlocking: false }
      ]);
      this.engine.updateEntityData({ saml: val });
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.engine.updateStepValidation('data', 'valid', []);
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  onComplete(finalData: any) {
    console.log('Completing onboarding with data:', finalData);
    // Submit to /api/v1/governance/onboarding/complete
    this.router.navigate(['/dashboard']);
  }
}
