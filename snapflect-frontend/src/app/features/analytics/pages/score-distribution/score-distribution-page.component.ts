import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-distribution-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Score Distribution</h2>
          <p class="text-muted text-sm mt-1">Histogram of final scores across the candidate pool.</p>
        </div>
        <select class="bg-input-bg border border-border text-main text-sm rounded-md px-3 py-2 outline-none focus:border-brand">
          <option>Frontend Engineering</option>
          <option>Backend Development</option>
          <option>Full Stack Developer</option>
        </select>
      </div>

      <!-- Main Content -->
      <div class="glass-card flex-1 p-6 flex flex-col relative min-h-[400px]">
        <h3 class="text-lg font-bold text-main mb-6">Distribution Curve</h3>
        
        <div class="flex-1 flex items-end gap-1 sm:gap-2 relative pt-12 pb-8 pl-12 pr-4">
          
          <!-- Background Grid & Y-Axis -->
          <div class="absolute inset-0 pl-12 pb-8 pr-4 flex flex-col justify-between pointer-events-none z-0 mt-12">
            <div class="w-full border-t border-border/40 relative"><span class="absolute -left-10 -top-2.5 text-xs text-muted font-medium">100</span></div>
            <div class="w-full border-t border-border/40 relative"><span class="absolute -left-10 -top-2.5 text-xs text-muted font-medium">75</span></div>
            <div class="w-full border-t border-border/40 relative"><span class="absolute -left-10 -top-2.5 text-xs text-muted font-medium">50</span></div>
            <div class="w-full border-t border-border/40 relative"><span class="absolute -left-10 -top-2.5 text-xs text-muted font-medium">25</span></div>
            <div class="w-full border-t border-border/40 relative"><span class="absolute -left-10 -top-2.5 text-xs text-muted font-medium">0</span></div>
          </div>

          <!-- The Bell Curve Overlay (SVG Approximation) -->
          <svg class="absolute inset-0 pl-12 pb-8 pr-4 h-full w-full pointer-events-none z-20 mt-12" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d="M 0,100 C 20,100 30,50 40,20 C 50,-10 60,20 70,50 C 80,100 90,100 100,100" 
                   fill="none" 
                   stroke="rgba(59, 130, 246, 0.8)" 
                   stroke-width="1.5" 
                   class="drop-shadow-lg shadow-brand"/>
             <path d="M 0,100 C 20,100 30,50 40,20 C 50,-10 60,20 70,50 C 80,100 90,100 100,100 L 100,100 L 0,100 Z" 
                   fill="url(#gradient)" 
                   opacity="0.2"/>
             <defs>
               <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stop-color="#3b82f6"/>
                 <stop offset="100%" stop-color="#1e293b" stop-opacity="0"/>
               </linearGradient>
             </defs>
          </svg>

          <!-- Histogram Bars -->
          <ng-container *ngFor="let bin of distributionBins">
            <div class="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end relative">
              <!-- Tooltip -->
              <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-30 shadow-lg border border-slate-700">
                Score {{ bin.range }}: {{ bin.count }} candidates
              </div>
              
              <div class="w-full max-w-[40px] rounded-t-sm bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600/50"
                   [style.height.%]="(bin.count / 100) * 100">
              </div>
              
              <!-- X-Axis Labels -->
              <span class="absolute -bottom-6 text-xs text-muted transform -rotate-45 origin-top-left font-medium">{{ bin.range }}</span>
            </div>
          </ng-container>

        </div>
        
        <!-- Legend -->
        <div class="absolute top-6 right-6 flex items-center gap-4 bg-glass border border-border p-3 rounded-lg shadow-lg">
           <div class="flex items-center gap-2 text-sm text-main">
              <div class="w-3 h-3 bg-slate-700 rounded-sm"></div> Candidates
           </div>
           <div class="flex items-center gap-2 text-sm text-main">
              <div class="w-4 h-0.5 bg-blue-500"></div> Normal Distribution
           </div>
        </div>

      </div>
    </div>
  `
})
export class ScoreDistributionPageComponent {
  distributionBins = [
    { range: '0-10', count: 2 },
    { range: '11-20', count: 5 },
    { range: '21-30', count: 12 },
    { range: '31-40', count: 25 },
    { range: '41-50', count: 45 },
    { range: '51-60', count: 70 },
    { range: '61-70', count: 95 },
    { range: '71-80', count: 65 },
    { range: '81-90', count: 35 },
    { range: '91-100', count: 15 },
  ];
}