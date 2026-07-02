import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-slide-over',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideOverAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[100] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div class="absolute inset-0 overflow-hidden">
        
        <!-- Backdrop -->
        <div 
          @backdropAnimation
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          (click)="close()">
        </div>

        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <!-- Slide-over panel -->
          <div 
            @slideOverAnimation
            class="pointer-events-auto w-screen max-w-md border-l border-border-light shadow-2xl">
            
            <div class="flex h-full flex-col bg-page overflow-y-scroll custom-scrollbar">
              
              <!-- Header -->
              <div class="px-6 py-6 border-b border-border-light bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-start justify-between">
                <div>
                  <h2 class="text-xl font-bold text-main" id="slide-over-title">{{ title }}</h2>
                  <p *ngIf="subtitle" class="mt-1 text-sm text-muted">{{ subtitle }}</p>
                </div>
                <div class="ml-3 flex h-7 items-center">
                  <button type="button" (click)="close()" class="rounded-md bg-transparent text-muted hover:text-main focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-surface-darker transition-colors">
                    <span class="sr-only">Close panel</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="relative mt-6 flex-1 px-6 sm:px-6">
                <ng-content></ng-content>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SlideOverComponent {
  @Input() isOpen = false;
  @Input() title = 'Panel Title';
  @Input() subtitle?: string;
  @Output() closeEvent = new EventEmitter<void>();

  close() {
    this.closeEvent.emit();
  }
}
