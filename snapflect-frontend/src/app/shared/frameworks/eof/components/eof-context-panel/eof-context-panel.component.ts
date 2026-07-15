import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EofWizardConfig, EofValidationRule } from '../../models/eof-config.model';

@Component({
  selector: 'app-eof-context-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-80 flex-shrink-0 border-l border-border-light h-full bg-input-bg overflow-y-auto hidden lg:block">
      
      <!-- DEFAULT CONTEXT (Applies to most steps) -->
      <div class="p-6 space-y-8" *ngIf="activeStepIndex !== 3 && activeStepIndex !== 4 && activeStepIndex !== 6">
        
        <!-- Summary Section -->
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Summary</h3>
          <div class="bg-white/5 rounded-lg p-4 border border-white/10">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-main">Readiness</span>
              <span class="text-sm font-bold text-brand">{{ progress }}%</span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full bg-card rounded-full h-1.5 mb-4">
              <div class="bg-brand h-1.5 rounded-full transition-all duration-500" [style.width.%]="progress"></div>
            </div>
            
            <p class="text-xs text-muted mb-2">Last saved: <span class="text-main">{{ lastSaved ? (lastSaved | date:'shortTime') : 'Not saved' }}</span></p>
          </div>
        </div>

        <!-- Setup Checklist -->
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            Setup Checklist
          </h3>
          <ul class="space-y-2">
            <li *ngFor="let step of config?.steps" class="flex items-center gap-3 text-sm">
              <span class="flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center border"
                    [ngClass]="{
                      'bg-brand border-brand text-white': step.status === 'valid',
                      'border-border-light text-transparent': step.status !== 'valid'
                    }">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </span>
              <span [ngClass]="step.status === 'valid' ? 'text-main line-through opacity-70' : 'text-main font-medium'">
                {{ step.displayName }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Activity Timeline -->
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Activity
          </h3>
          <div class="relative border-l border-border-light ml-2 space-y-4 pb-2">
            <div class="relative pl-4">
              <span class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand ring-4 ring-input-bg"></span>
              <p class="text-sm text-main font-medium">Provisioning Started</p>
              <p class="text-xs text-muted mt-0.5">Just now</p>
            </div>
            <div class="relative pl-4" *ngIf="lastSaved">
              <span class="absolute -left-1 top-2 w-2 h-2 rounded-full bg-border-light"></span>
              <p class="text-sm text-muted">Draft Auto-saved</p>
              <p class="text-xs text-muted mt-0.5">{{ lastSaved | date:'shortTime' }}</p>
            </div>
          </div>
        </div>

      </div>

      <!-- BRANDING CONTEXT (Step 3) -->
      <div class="p-6 space-y-8" *ngIf="activeStepIndex === 3">
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Live Preview</h3>
          <div class="bg-card rounded-lg border border-border-light overflow-hidden shadow-sm">
            <div class="h-10 bg-surface border-b border-border-light flex items-center px-4 gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div class="p-4 flex flex-col items-center text-center">
              <div class="w-12 h-12 bg-surface border border-border-light rounded-md mb-3 flex items-center justify-center text-muted text-xs">Logo</div>
              <div class="h-2 w-24 bg-surface rounded mb-2"></div>
              <div class="h-2 w-16 bg-surface rounded"></div>
              <button class="mt-4 w-full py-1.5 rounded bg-brand text-white text-xs font-semibold">Sign In</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECURITY CONTEXT (Step 4) -->
      <div class="p-6 space-y-8" *ngIf="activeStepIndex === 4">
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Security Score</h3>
          <div class="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between">
            <span class="text-3xl font-black text-yellow-500">65<span class="text-sm">%</span></span>
            <span class="text-xs font-medium text-yellow-500/80 uppercase tracking-wider">Fair</span>
          </div>
          <p class="text-xs text-muted mt-3">Enforce MFA and SAML to achieve an Excellent security score.</p>
        </div>
      </div>

      <!-- REVIEW CONTEXT (Step 6) -->
      <div class="p-6 space-y-8" *ngIf="activeStepIndex === 6">
        <div>
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Provisioning Check
          </h3>
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p class="text-sm text-green-500 font-medium mb-1">Ready to Activate</p>
            <p class="text-xs text-green-500/70">All blocking rules satisfied. You may provision this tenant.</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class EofContextPanelComponent {
  @Input() progress: number = 0;
  @Input() actionables: { stepName: string, rule: EofValidationRule }[] = [];
  @Input() lastSaved: Date | null = null;
  @Input() activeStepIndex: number = 0;
  @Input() config: EofWizardConfig | null = null;
}
