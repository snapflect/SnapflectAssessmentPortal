import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SlideOverComponent } from '../../../../shared/components/slide-over/slide-over.component';

@Component({
  selector: 'app-publish-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideOverComponent],
  template: `
    <app-slide-over [isOpen]="true" title="Publish Assessment" (closeEvent)="close()">
      <div class="flex flex-col h-full min-h-[75vh] -mt-2 pb-6">
        
        <!-- Stepper -->
        <div class="pb-6 border-b border-white/5 flex flex-col gap-4">
          <div class="flex items-center justify-between relative">
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/5"></div>
            <div class="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand transition-all duration-300" 
                 [style.width]="(currentStep - 1) * 50 + '%'"></div>
            
            <div *ngFor="let step of [1, 2, 3, 4]; let i = index" 
                 class="relative flex flex-col items-center gap-2 z-10 bg-surface px-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300"
                   [ngClass]="{
                     'bg-brand border-brand text-white': currentStep >= step,
                     'bg-white/5 border-white/10 text-muted': currentStep < step
                   }">
                <ng-container *ngIf="currentStep > step">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </ng-container>
                <span *ngIf="currentStep <= step">{{ step }}</span>
              </div>
              <span class="text-xs font-medium whitespace-nowrap" [ngClass]="currentStep >= step ? 'text-main' : 'text-muted'">
                {{ stepNames[i] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content Body -->
        <div class="pt-6 overflow-y-visible flex-1">
          <form [formGroup]="publishForm">
            <!-- Step 1: General -->
            <div *ngIf="currentStep === 1" class="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div *ngIf="!assessment" class="form-group">
                <label class="text-sm font-medium text-main mb-1.5 block">Select Assessment</label>
                <select formControlName="assessment_uuid" class="form-input w-full bg-surface">
                  <option value="">Select an Assessment...</option>
                  <option *ngFor="let a of availableAssessments" [value]="a.uuid">{{ a.attributes?.assessment_name || a.attributes?.title }} ({{ a.attributes?.assessment_code || a.attributes?.code }})</option>
                </select>
              </div>
              <div class="form-group">
                <label class="text-sm font-medium text-main mb-1.5 block">Publication Title</label>
                <input type="text" formControlName="title" class="form-input w-full" placeholder="e.g. Q3 Hiring Batch">
              </div>
              <div class="form-group">
                <label class="text-sm font-medium text-main mb-1.5 block">Publication Code</label>
                <input type="text" formControlName="publication_code" class="form-input w-full uppercase" placeholder="e.g. PUB-123456">
                <p class="text-xs text-muted mt-1.5">A unique identifier for this specific delivery cohort.</p>
              </div>
            </div>

            <!-- Step 2: Scheduling -->
            <div *ngIf="currentStep === 2" class="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="text-sm font-medium text-main mb-1.5 block">Start Date & Time</label>
                  <input type="datetime-local" formControlName="start_date" class="form-input w-full">
                </div>
                <div class="form-group">
                  <label class="text-sm font-medium text-main mb-1.5 block">End Date & Time (Optional)</label>
                  <input type="datetime-local" formControlName="end_date" class="form-input w-full">
                </div>
              </div>
              <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <svg class="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm text-blue-100">Candidates will only be able to start the assessment between these dates. If no end date is provided, it remains open indefinitely.</p>
              </div>
            </div>

            <!-- Step 3: Settings -->
            <div *ngIf="currentStep === 3" class="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div class="form-group">
                <label class="text-sm font-medium text-main mb-1.5 block">Maximum Attempts per Candidate</label>
                <input type="number" formControlName="max_attempts" class="form-input w-full" min="1">
              </div>
              
              <div class="p-4 border border-white/10 rounded-xl bg-white/5 flex items-start gap-4">
                <div class="mt-1">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="is_proctored" class="sr-only peer">
                    <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-main">Enable Strict Proctoring</h4>
                  <p class="text-xs text-muted mt-1 leading-relaxed">
                    When enabled, candidates will be monitored for tab-switching, copy-pasting, and window focus changes. 
                    Violations will be logged in their final report. <br>
                    <span class="text-yellow-400/90 font-medium">Note: May require camera/microphone permissions depending on global platform settings.</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 4: Candidates -->
            <div *ngIf="currentStep === 4" class="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div class="p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
                <h4 class="text-sm font-semibold text-main mb-1">Public Registration Link</h4>
                <div class="flex items-center gap-2">
                  <input type="text" readonly [value]="getPublicLink()" class="form-input flex-1 font-mono text-xs text-muted" (click)="$any($event.target).select()">
                </div>
                <p class="text-xs text-muted mt-2">Share this link to allow candidates to self-register for this publication.</p>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-main mb-2">Assign Candidates Manually</h4>
                <div class="flex gap-2 mb-3">
                  <input type="email" #emailInput class="form-input flex-1" placeholder="Enter candidate email" (keydown.enter)="addEmail(emailInput.value); emailInput.value=''; $event.preventDefault()">
                  <button type="button" (click)="addEmail(emailInput.value); emailInput.value=''" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-main rounded-lg text-sm font-medium transition-colors">Add</button>
                </div>
                
                <div class="flex gap-2 items-center mb-4">
                  <div class="flex-1 h-px bg-white/10"></div>
                  <span class="text-xs font-medium text-muted uppercase">OR</span>
                  <div class="flex-1 h-px bg-white/10"></div>
                </div>

                <div class="flex items-center gap-4 p-4 border border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" (click)="fileInput.click()">
                  <div class="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-main">Upload CSV File</p>
                    <p class="text-xs text-muted mt-0.5">A single column CSV containing candidate emails</p>
                  </div>
                  <button type="button" (click)="downloadCsvTemplate($event)" class="text-xs text-brand hover:text-brand-light font-medium flex items-center gap-1.5 bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg border border-brand/20 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Template
                  </button>
                  <input type="file" #fileInput accept=".csv" class="hidden" (change)="handleCsvUpload($event)">
                </div>
              </div>

              <div *ngIf="candidateEmails.length > 0" class="mt-4">
                <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Selected Candidates ({{candidateEmails.length}})</h4>
                <div class="max-h-40 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 p-2 border border-white/5 bg-white/5 rounded-lg">
                  <div *ngFor="let email of candidateEmails; let idx = index" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs text-main">
                    {{ email }}
                    <button type="button" (click)="removeEmail(idx)" class="text-muted hover:text-red-400 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="pt-6 mt-6 border-t border-white/5 bg-transparent flex justify-between items-center mt-auto">
          <button (click)="close()" class="text-sm font-medium text-muted hover:text-main transition-colors">Cancel</button>
          
          <div class="flex gap-3">
            <button *ngIf="currentStep > 1" (click)="prevStep()" class="btn-secondary px-6 py-2 rounded-xl border border-white/10 text-main font-medium hover:bg-white/5 transition-colors">Back</button>
            <button *ngIf="currentStep < 4" (click)="nextStep()" class="btn-primary px-6 py-2 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" [disabled]="!isCurrentStepValid()">Next</button>
            <button *ngIf="currentStep === 4" (click)="submit()" class="btn-primary px-6 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" [disabled]="publishForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Publish Assessment</span>
              <span *ngIf="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Publishing...
              </span>
            </button>
          </div>
        </div>
      </div>
    </app-slide-over>
  `,
  styles: [`
    .form-input {
      @apply bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-main text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all;
    }
  `]
})
export class PublishWizardComponent implements OnInit {
  @Input() assessment!: any;
  @Input() availableAssessments: any[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() published = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  
  currentStep = 1;
  stepNames = ['General', 'Scheduling', 'Settings', 'Candidates'];
  isSubmitting = false;
  candidateEmails: string[] = [];

  publishForm!: FormGroup;

  ngOnInit() {
    const randomCode = 'PUB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const defaultTitle = this.assessment ? this.assessment.attributes.assessment_name + ' Publication' : 'New Publication';
    
    // Set start date to now (formatted for datetime-local input)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const startStr = now.toISOString().slice(0, 16);

    this.publishForm = this.fb.group({
      assessment_uuid: [this.assessment ? this.assessment.uuid : '', this.assessment ? [] : Validators.required],
      title: [defaultTitle, Validators.required],
      publication_code: [randomCode, Validators.required],
      start_date: [startStr, Validators.required],
      end_date: [''],
      max_attempts: [1, [Validators.required, Validators.min(1)]],
      is_proctored: [false]
    });
  }

  // Subscribe to assessment selection to update default title
  ngAfterViewInit() {
    if (!this.assessment) {
      this.publishForm.get('assessment_uuid')?.valueChanges.subscribe(uuid => {
        if (uuid) {
          const selected = this.availableAssessments.find(a => a.uuid === uuid);
          if (selected && !this.publishForm.get('title')?.dirty) {
            this.publishForm.patchValue({ title: (selected.attributes?.assessment_name || selected.attributes?.title) + ' Publication' });
          }
        }
      });
    }
  }

  close() {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  nextStep() {
    if (this.currentStep < 4 && this.isCurrentStepValid()) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      const isAssValid = this.assessment ? true : this.publishForm.get('assessment_uuid')!.valid;
      return isAssValid && this.publishForm.get('title')!.valid && this.publishForm.get('publication_code')!.valid;
    }
    if (this.currentStep === 2) {
      return this.publishForm.get('start_date')!.valid;
    }
    return true;
  }

  getPublicLink(): string {
    const code = this.publishForm?.get('publication_code')?.value || '';
    return window.location.origin + '/delivery/register/' + code;
  }

  addEmail(email: string) {
    if (email && email.includes('@') && !this.candidateEmails.includes(email.trim().toLowerCase())) {
      this.candidateEmails.push(email.trim().toLowerCase());
    }
  }

  removeEmail(index: number) {
    this.candidateEmails.splice(index, 1);
  }

  downloadCsvTemplate(event: Event) {
    event.stopPropagation(); // Prevent triggering the file upload dialog
    const csvContent = "email\ncandidate1@snapflect.com\ncandidate2@snapflect.com\ncandidate3@snapflect.com\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapflect_candidates_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  handleCsvUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/[\r\n]+/);
      lines.forEach(line => {
        const parts = line.split(',');
        parts.forEach(part => {
          this.addEmail(part);
        });
      });
      event.target.value = ''; // reset
    };
    reader.readAsText(file);
  }

  submit() {
    if (this.publishForm.invalid) return;
    this.isSubmitting = true;
    
    const formValue = { ...this.publishForm.value };
    
    if (formValue.start_date) {
      formValue.start_date = new Date(formValue.start_date).toISOString();
    }
    
    if (formValue.end_date) {
      formValue.end_date = new Date(formValue.end_date).toISOString();
    }
    
    const payload = {
      ...formValue,
      candidate_emails: this.candidateEmails
    };
    
    this.published.emit(payload);
  }
}
