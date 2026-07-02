import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmService.state().isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
           (click)="cancel()"></div>
      
      <!-- Modal Panel -->
      <div class="relative w-full max-w-sm glass-card border border-border-light rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-white/5 flex items-center gap-4">
          <div [ngClass]="getIconContainerClass(options?.variant)" class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg *ngIf="options?.variant === 'danger'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg *ngIf="options?.variant === 'warning'" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg *ngIf="options?.variant === 'info' || !options?.variant" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-main">{{ options?.title }}</h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
          <p class="text-sm text-muted leading-relaxed">{{ options?.message }}</p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-input-bg border-t border-white/5 flex items-center justify-end gap-3">
          <button (click)="cancel()" class="btn-secondary text-sm px-4 py-2 hover:bg-white/10 transition-colors">
            {{ options?.cancelText || 'Cancel' }}
          </button>
          <button (click)="confirm()" [ngClass]="getConfirmButtonClass(options?.variant)" class="text-sm px-4 py-2 rounded-lg font-medium shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-black">
            {{ options?.confirmText || 'Confirm' }}
          </button>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ConfirmModalComponent {
  public confirmService = inject(ConfirmService);

  get options() {
    return this.confirmService.state().options;
  }

  cancel() {
    this.confirmService.resolve(false);
  }

  confirm() {
    this.confirmService.resolve(true);
  }

  getIconContainerClass(variant?: string): string {
    switch (variant) {
      case 'danger': return 'bg-red-500/10 border border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border border-amber-500/20';
      case 'info':
      default: return 'bg-blue-500/10 border border-blue-500/20';
    }
  }

  getConfirmButtonClass(variant?: string): string {
    switch (variant) {
      case 'danger': return 'bg-red-500 hover:bg-red-400 text-main focus:ring-red-500/50';
      case 'warning': return 'bg-amber-500 hover:bg-amber-400 text-black focus:ring-amber-500/50';
      case 'info':
      default: return 'bg-brand hover:bg-brand-light text-main focus:ring-brand/50';
    }
  }
}
