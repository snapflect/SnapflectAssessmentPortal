import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EofWizardConfig } from '../../models/eof-config.model';
import { EofEngineService } from '../../services/eof-engine.service';
import { EofDraftService } from '../../services/eof-draft.service';
import { EofValidationService } from '../../services/eof-validation.service';
import { EofStepNavComponent } from '../eof-step-nav/eof-step-nav.component';
import { EofContextPanelComponent } from '../eof-context-panel/eof-context-panel.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-eof-layout',
  standalone: true,
  imports: [CommonModule, EofStepNavComponent, EofContextPanelComponent],
  template: `
    <div class="h-full w-full bg-card flex flex-col rounded-xl shadow-2xl overflow-hidden border border-border-light">
      <!-- Top Header Command Center -->
      <header class="h-16 flex-shrink-0 border-b border-border-light bg-card flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <button (click)="close.emit()" class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-muted hover:text-main hover:bg-white/5 transition-colors border border-border-light">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-lg font-bold text-main">{{ config?.title || 'Provision Workspace' }}</h1>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Draft</span>
            </div>
            <p class="text-xs text-muted flex items-center gap-2" *ngIf="isSaving">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Auto Saving...
            </p>
            <p class="text-xs text-muted flex items-center gap-2" *ngIf="!isSaving && lastSaved">
              <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              All changes saved
            </p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex flex-col items-end">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider">Progress</span>
            <span class="text-sm font-bold text-main">Step {{ activeIndex + 1 }} of {{ config?.steps?.length }} ({{ progress }}%)</span>
          </div>
          <div class="h-8 w-px bg-border-light"></div>
          <div class="flex flex-col items-end">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider">Tenant Type</span>
            <span class="text-sm font-bold text-main">{{ tenantType }}</span>
          </div>
        </div>
      </header>

      <!-- Three-Panel Body -->
      <div class="flex-1 overflow-hidden flex relative">
        
        <!-- Global Loading Overlay -->
        <div *ngIf="isLoading" class="absolute inset-0 z-[150] bg-page/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <svg class="w-10 h-10 text-brand animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-sm font-semibold text-main">Loading Workspace Data...</p>
        </div>

        <!-- Provisioning Overlay Modal -->
        <div *ngIf="isProvisioning" class="absolute inset-0 z-[100] bg-page/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div class="bg-card border-2 border-border-light shadow-2xl rounded-2xl p-10 max-w-md w-full relative overflow-hidden">
            <h2 class="text-xl font-bold text-main text-center mb-8">Provisioning Workspace...</h2>
            
            <div class="space-y-4">
              <div *ngFor="let step of provisioningSteps; let i = index" class="flex items-center gap-4">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                     [ngClass]="{
                       'bg-green-500/20 text-green-500': provisioningProgress > i,
                       'bg-brand/20 text-brand animate-pulse': provisioningProgress === i,
                       'bg-surface border border-border-light text-muted': provisioningProgress < i
                     }">
                  <svg *ngIf="provisioningProgress > i" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  <span *ngIf="provisioningProgress <= i" class="w-2 h-2 rounded-full" [ngClass]="provisioningProgress === i ? 'bg-brand' : 'bg-muted'"></span>
                </div>
                <span class="text-sm font-medium" [ngClass]="provisioningProgress >= i ? 'text-main' : 'text-muted'">{{ step }}</span>
              </div>
            </div>
            
            <div class="mt-8 pt-4 border-t border-border-light text-center">
              <p class="text-xs text-muted">Please do not close this window.</p>
            </div>
          </div>
        </div>
        
        <!-- Left Panel: Step Nav -->
        <app-eof-step-nav
          [config]="config"
          [activeIndex]="activeIndex"
          (selectStep)="goToStep($event)">
        </app-eof-step-nav>

        <!-- Center Panel: Form Content -->
        <div class="flex-1 flex flex-col overflow-hidden bg-page">
          <!-- Dynamic Form Injection Area -->
          <div class="flex-1 overflow-y-auto p-6 md:p-10">
            <div class="max-w-3xl mx-auto">
              <ng-content></ng-content>
            </div>
          </div>

          <!-- Bottom Footer Navigation -->
          <div class="flex-shrink-0 border-t border-border-light p-4 bg-card flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button (click)="close.emit()" class="btn-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
              <span class="text-xs text-muted" *ngIf="lastSaved">Draft saved at {{ lastSaved | date:'shortTime' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button 
                *ngIf="activeIndex > 0"
                (click)="previousStep()" 
                class="btn-secondary px-4 py-2 rounded-lg text-sm">Previous</button>
              
              <button 
                *ngIf="!isLastStep"
                (click)="nextStep()" 
                class="btn-primary px-6 py-2 rounded-lg text-sm font-semibold">Next Step</button>
              
              <button 
                *ngIf="isLastStep"
                [disabled]="!isReady"
                (click)="completeOnboarding()" 
                class="btn-primary bg-brand text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Complete Setup</button>
            </div>
          </div>
        </div>

        <!-- Right Panel: Context Panel -->
        <app-eof-context-panel
          [progress]="progress"
          [actionables]="actionables"
          [lastSaved]="lastSaved"
          [activeStepIndex]="activeIndex"
          [config]="config">
        </app-eof-context-panel>

      </div>
    </div>
  `
})
export class EofLayoutComponent implements OnInit, OnDestroy {
  @Input() config!: EofWizardConfig;
  @Input() isLoading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() complete = new EventEmitter<any>();

  public engine = inject(EofEngineService);
  private validationService = inject(EofValidationService);
  private draftService = inject(EofDraftService);

  private subs = new Subscription();

  activeIndex: number = 0;
  progress: number = 0;
  isReady: boolean = false;
  actionables: any[] = [];
  lastSaved: Date | null = null;
  isSaving: boolean = false;
  tenantType: string = 'Enterprise';
  
  isProvisioning: boolean = false;
  provisioningProgress: number = 0;
  provisioningSteps = [
    'Creating Database Tenant',
    'Assigning License',
    'Generating Default Roles',
    'Creating Administrator',
    'Configuring Permissions',
    'Finalizing Environment'
  ];

  ngOnInit() {
    this.engine.initWizard(this.config);

    this.subs.add(this.engine.activeStepIndex$.subscribe(idx => this.activeIndex = idx));
    this.subs.add(this.engine.config$.subscribe(cfg => {
      if (cfg) {
        this.config = cfg;
        this.isReady = this.validationService.isReadyForActivation(cfg);
        this.actionables = this.validationService.getPendingActionables(cfg);
      }
    }));
    this.subs.add(this.validationService.progress$.subscribe(p => this.progress = p));
    this.subs.add(this.draftService.draftSaved$.subscribe(date => this.lastSaved = date));
    this.subs.add(this.draftService.isSaving$.subscribe(saving => this.isSaving = saving));
    this.subs.add(this.engine.entityData$.subscribe(data => {
      if (data && data.tenant_type) {
        this.tenantType = data.tenant_type === 'partner' ? 'Partner' : 'Enterprise';
      }
    }));
  }

  get isLastStep(): boolean {
    return this.config && this.activeIndex === this.config.steps.filter(s => !(s as any).hidden).length - 1;
  }

  goToStep(index: number) {
    this.engine.goToStep(index);
  }

  nextStep() {
    this.engine.nextStep();
  }

  previousStep() {
    this.engine.previousStep();
  }

  completeOnboarding() {
    this.isProvisioning = true;
    this.provisioningProgress = 0;

    // Simulate provisioning sequence
    const interval = setInterval(() => {
      this.provisioningProgress++;
      if (this.provisioningProgress >= this.provisioningSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          this.engine.completeOnboarding();
          let data;
          this.engine.entityData$.subscribe(d => data = d).unsubscribe();
          this.complete.emit(data);
          this.isProvisioning = false;
        }, 800);
      }
    }, 600); // 600ms per step
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.engine.destroy();
  }
}
