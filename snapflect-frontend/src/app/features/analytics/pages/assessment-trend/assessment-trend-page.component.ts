import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-trend-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Assessment Trends</h2>
          <p class="text-muted text-sm mt-1">Volume of assessments taken over the last 12 months.</p>
        </div>
        <select class="bg-input-bg border border-border text-main text-sm rounded-md px-3 py-2 outline-none focus:border-brand">
          <option>All Assessments</option>
          <option>Frontend Engineering</option>
          <option>Backend Development</option>
        </select>
      </div>

      <!-- Main Content -->
      <div class="glass-card flex-1 p-6 flex flex-col">
        <h3 class="text-lg font-bold text-main mb-6">Attempt Volume</h3>
        
        <div class="flex-1 flex items-end gap-2 sm:gap-4 relative pt-10">
          <!-- Grid lines -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 z-0">
            <div class="w-full border-t border-border/40"></div>
            <div class="w-full border-t border-border/40"></div>
            <div class="w-full border-t border-border/40"></div>
            <div class="w-full border-t border-border/40"></div>
            <div class="w-full border-t border-border/40"></div>
          </div>

          <!-- Y Axis Labels -->
          <div class="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-muted pb-8 pointer-events-none font-medium z-10 -ml-8">
            <span>1K</span>
            <span>750</span>
            <span>500</span>
            <span>250</span>
            <span>0</span>
          </div>

          <!-- Bars -->
          <ng-container *ngFor="let month of trendData">
            <div class="flex-1 flex flex-col items-center gap-2 z-10 group">
              <!-- Tooltip -->
              <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                {{ month.attempts }} attempts
              </div>
              <div class="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-brand/20 to-brand/80 transition-all duration-500 hover:to-brand relative"
                   [style.height.%]="(month.attempts / 1000) * 100">
              </div>
              <span class="text-xs text-muted mt-2 font-medium">{{ month.label }}</span>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class AssessmentTrendPageComponent {
  trendData = [
    { label: 'Jan', attempts: 320 },
    { label: 'Feb', attempts: 450 },
    { label: 'Mar', attempts: 510 },
    { label: 'Apr', attempts: 480 },
    { label: 'May', attempts: 600 },
    { label: 'Jun', attempts: 750 },
    { label: 'Jul', attempts: 820 },
    { label: 'Aug', attempts: 710 },
    { label: 'Sep', attempts: 890 },
    { label: 'Oct', attempts: 920 },
    { label: 'Nov', attempts: 950 },
    { label: 'Dec', attempts: 880 }
  ];
}