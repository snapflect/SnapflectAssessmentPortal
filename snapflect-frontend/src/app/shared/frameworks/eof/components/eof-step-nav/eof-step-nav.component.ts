import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EofWizardConfig, EofStepConfig } from '../../models/eof-config.model';

@Component({
  selector: 'app-eof-step-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-64 flex-shrink-0 border-r border-border-light h-full bg-input-bg overflow-y-auto hidden md:block">
      <div class="p-6">
        <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-6">Steps</h3>
        
        <div class="space-y-1 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          
          <ng-container *ngFor="let step of visibleSteps; let i = index">
            <button 
              (click)="selectStep.emit(i)"
              [class.bg-white_5]="activeIndex === i"
              [class.border-brand]="activeIndex === i"
              [class.border-transparent]="activeIndex !== i"
              class="w-full text-left relative flex items-center gap-3 p-3 rounded-lg border-l-2 hover:bg-white/5 transition-colors group cursor-pointer z-10">
              
              <!-- Icon Indicator -->
              <span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-input-bg transition-colors"
                    [ngClass]="{
                      'bg-brand text-white': activeIndex === i,
                      'bg-success/20 text-success': activeIndex !== i && step.status === 'valid',
                      'bg-danger/20 text-danger': activeIndex !== i && step.status === 'invalid',
                      'bg-white/10 text-muted': activeIndex !== i && step.status === 'pending'
                    }">
                <ng-container *ngIf="step.status === 'valid' && activeIndex !== i">✓</ng-container>
                <ng-container *ngIf="step.status === 'invalid' && activeIndex !== i">!</ng-container>
                <ng-container *ngIf="step.status === 'pending' || activeIndex === i">{{ i + 1 }}</ng-container>
              </span>

              <!-- Label and Meta -->
              <div class="flex flex-col">
                <span class="text-sm font-medium transition-colors"
                      [ngClass]="{
                        'text-main': activeIndex === i,
                        'text-muted group-hover:text-main': activeIndex !== i
                      }">
                  {{ step.displayName }}
                </span>
                
                <!-- Smart Metadata -->
                <span class="text-[10px] uppercase tracking-wider font-semibold mt-0.5"
                      [ngClass]="{
                        'text-danger': step.status === 'invalid',
                        'text-warning': step.status === 'warning',
                        'text-muted/60': step.status === 'pending' || step.status === 'valid'
                      }">
                  <ng-container *ngIf="step.status === 'invalid'">Blocking Errors</ng-container>
                  <ng-container *ngIf="step.status === 'warning'">Needs Review</ng-container>
                  <ng-container *ngIf="step.status === 'valid' && !step.isRequired">Configured</ng-container>
                  <ng-container *ngIf="step.status === 'valid' && step.isRequired">Required</ng-container>
                  <ng-container *ngIf="step.status === 'pending' && !step.isRequired">Optional</ng-container>
                  <ng-container *ngIf="step.status === 'pending' && step.isRequired">Required</ng-container>
                </span>
              </div>
            </button>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class EofStepNavComponent {
  @Input() config: EofWizardConfig | null = null;
  @Input() activeIndex: number = 0;
  @Output() selectStep = new EventEmitter<number>();

  get visibleSteps(): EofStepConfig[] {
    if (!this.config) return [];
    return this.config.steps.filter(s => !(s as any).hidden);
  }
}
