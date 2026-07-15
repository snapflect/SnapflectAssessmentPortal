import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eof-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-input-bg border border-border-light rounded-xl overflow-hidden mb-6 transition-all duration-300">
      
      <!-- Card Header -->
      <button 
        type="button"
        class="w-full flex items-center justify-between p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
        [class.cursor-default]="!collapsible"
        (click)="toggle()">
        
        <div class="flex items-start gap-4">
          <!-- Optional Status/Icon -->
          <div *ngIf="icon" class="flex-shrink-0 w-10 h-10 rounded-lg bg-surface/50 border border-border-light flex items-center justify-center text-brand">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="icon"></path>
            </svg>
          </div>
          
          <div class="text-left">
            <h3 class="text-base font-bold text-main m-0 leading-none">{{ title }}</h3>
            <p *ngIf="description" class="text-sm text-muted mt-1.5 leading-snug">{{ description }}</p>
          </div>
        </div>

        <!-- Right Side: Status Badge or Collapse Icon -->
        <div class="flex items-center gap-4">
          <span *ngIf="status === 'valid'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-semibold">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            Configured
          </span>
          <span *ngIf="status === 'warning'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-semibold">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Review Needed
          </span>

          <svg *ngIf="collapsible" 
               class="w-5 h-5 text-muted transition-transform duration-300"
               [class.rotate-180]="expanded"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Card Body -->
      <div 
        class="transition-all duration-300 ease-in-out"
        [class.h-0]="!expanded"
        [class.opacity-0]="!expanded"
        [class.overflow-hidden]="!expanded">
        <div class="p-6 pt-0 border-t border-white/5">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class EofCardComponent {
  @Input() title: string = '';
  @Input() description?: string;
  @Input() icon?: string;
  @Input() status?: 'valid' | 'invalid' | 'warning' | 'pending';
  @Input() collapsible: boolean = false;
  @Input() expanded: boolean = true;

  toggle() {
    if (this.collapsible) {
      this.expanded = !this.expanded;
    }
  }
}
