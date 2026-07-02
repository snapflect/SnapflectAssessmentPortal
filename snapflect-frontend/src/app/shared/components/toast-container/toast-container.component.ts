import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 w-full max-w-sm pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()" 
           @toastAnimation
           class="pointer-events-auto overflow-hidden shadow-2xl rounded-xl border backdrop-blur-md"
           [ngClass]="getToastClasses(toast.type)">
        
        <div class="p-4 flex items-start gap-3">
          
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5" [ngSwitch]="toast.type">
            <svg *ngSwitchCase="'success'" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg *ngSwitchCase="'error'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg *ngSwitchCase="'warning'" class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg *ngSwitchCase="'info'" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>

          <!-- Content -->
          <div class="flex-1 w-0">
            <h4 class="text-sm font-bold text-main mb-1">{{ toast.title }}</h4>
            <p class="text-sm text-muted">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button (click)="toastService.remove(toast.id)" class="flex-shrink-0 text-muted hover:text-main transition-colors focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Optional Progress Bar (Pure CSS animation based on duration) -->
        <div *ngIf="toast.durationMs && toast.durationMs > 0" 
             class="h-1 bg-white/20 origin-left"
             [style.animation]="'toast-progress ' + toast.durationMs + 'ms linear forwards'">
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);

  getToastClasses(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-card border border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]';
      case 'error': return 'bg-card border border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.15)]';
      case 'warning': return 'bg-card border border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)]';
      case 'info': return 'bg-card border border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]';
      default: return 'bg-card border border-border-light shadow-lg';
    }
  }
}
