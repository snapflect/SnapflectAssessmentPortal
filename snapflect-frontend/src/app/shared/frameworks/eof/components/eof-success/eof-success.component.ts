import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-eof-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center bg-page p-4 md:p-6 animate-fade-in-up overflow-y-auto">
      <div class="bg-card border border-border-light shadow-2xl rounded-2xl max-w-2xl w-full p-6 md:p-8 flex flex-col items-center relative overflow-hidden my-auto">
        
        <!-- Background Glow -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-green-500/10 blur-[40px] pointer-events-none"></div>

        <!-- Success Icon -->
        <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 relative z-10">
          <div class="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
          <svg class="w-8 h-8 text-green-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <!-- Headers -->
        <h2 class="text-2xl font-black text-main mb-1 relative z-10 text-center">{{ headerTitle }}</h2>
        <p class="text-sm text-muted max-w-md mb-6 relative z-10">{{ description }}</p>

        <!-- Setup Score -->
        <div *ngIf="readinessScore" class="w-full bg-input-bg border border-border-light rounded-xl p-4 mb-6 flex items-center justify-between text-left relative z-10">
          <div>
            <h4 class="text-sm font-bold text-main uppercase tracking-wider">Configuration Readiness</h4>
            <p class="text-xs text-muted mt-1">
              {{ readinessScore === 100 ? 'Perfectly configured for production.' : 'Partially configured. You can optimize this later.' }}
            </p>
          </div>
          <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-inner bg-card"
               [ngClass]="readinessScore === 100 ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'">
            <span class="text-base font-bold">{{ readinessScore }}<span class="text-[10px]">%</span></span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="w-full text-left mb-6 relative z-10">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Suggested Next Steps</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <button *ngFor="let action of quickActions"
                    (click)="actionClicked.emit(action.id)"
                    class="flex flex-col text-left p-3 rounded-xl border border-border-light bg-input-bg hover:border-brand hover:bg-brand/5 transition-all group">
              <svg class="w-5 h-5 text-brand mb-2 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon"></path>
              </svg>
              <span class="text-sm font-bold text-main mb-0.5">{{ action.label }}</span>
              <span class="text-[10px] text-muted leading-tight line-clamp-2">{{ action.description }}</span>
            </button>
            
          </div>
        </div>

        <!-- Bottom Action -->
        <div class="w-full border-t border-border-light pt-4 relative z-10">
          <button (click)="done.emit()" class="btn-primary w-full py-2.5 rounded-xl font-semibold shadow-sm text-sm">
            Return to Dashboard
          </button>
        </div>
        
      </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class EofSuccessComponent {
  @Input() headerTitle: string = 'Successfully Provisioned!';
  @Input() description: string = 'The entity has been created and is now active in your workspace.';
  @Input() readinessScore?: number;
  @Input() quickActions: QuickAction[] = [];

  @Output() actionClicked = new EventEmitter<string>();
  @Output() done = new EventEmitter<void>();
}
