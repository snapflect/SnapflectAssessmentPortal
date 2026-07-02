import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-completion-metrics-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Completion Metrics</h2>
          <p class="text-muted text-sm mt-1">Drop-off and completion rates across your assessments.</p>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-card p-6 border-l-4 border-l-emerald-500">
          <p class="text-muted text-sm font-medium">Platform Completion Rate</p>
          <h3 class="text-4xl font-bold text-emerald-400 mt-2">84.2%</h3>
          <p class="text-xs text-muted mt-2">↑ 2.4% from last month</p>
        </div>
        <div class="glass-card p-6 border-l-4 border-l-amber-500">
          <p class="text-muted text-sm font-medium">Average Time to Complete</p>
          <h3 class="text-4xl font-bold text-amber-400 mt-2">42m</h3>
          <p class="text-xs text-muted mt-2">Across all assessments</p>
        </div>
        <div class="glass-card p-6 border-l-4 border-l-rose-500">
          <p class="text-muted text-sm font-medium">Highest Drop-off Point</p>
          <h3 class="text-xl font-bold text-rose-400 mt-2 line-clamp-1">Section 3: System Design</h3>
          <p class="text-xs text-muted mt-2">React Sr. Developer Assessment</p>
        </div>
      </div>

      <!-- Funnel Chart (CSS) -->
      <div class="glass-card flex-1 p-6 flex flex-col">
        <h3 class="text-lg font-bold text-main mb-6">Assessment Funnel (Last 30 Days)</h3>
        
        <div class="flex-1 flex flex-col justify-center items-center gap-4 max-w-3xl mx-auto w-full py-8">
          
          <div class="w-full flex items-center gap-4 group">
            <div class="w-32 text-right">
              <span class="text-sm font-bold text-main block">Invited</span>
              <span class="text-xs text-muted">1,250 users</span>
            </div>
            <div class="flex-1 h-12 bg-slate-800 rounded-r-md rounded-l-sm relative overflow-hidden flex items-center shadow-inner">
              <div class="absolute inset-y-0 left-0 bg-blue-500/80 w-full transition-all duration-1000 ease-out"></div>
              <span class="relative z-10 ml-4 font-bold text-white shadow-sm">100%</span>
            </div>
          </div>

          <div class="w-full flex items-center gap-4 group">
            <div class="w-32 text-right">
              <span class="text-sm font-bold text-main block">Started</span>
              <span class="text-xs text-muted">1,080 users</span>
            </div>
            <div class="flex-1 h-12 bg-slate-800 rounded-r-md rounded-l-sm relative overflow-hidden flex items-center">
              <div class="absolute inset-y-0 left-0 bg-indigo-500/80 transition-all duration-1000 ease-out" style="width: 86.4%"></div>
              <span class="relative z-10 ml-4 font-bold text-white">86.4%</span>
            </div>
          </div>

          <div class="w-full flex items-center gap-4 group">
            <div class="w-32 text-right">
              <span class="text-sm font-bold text-main block">Completed</span>
              <span class="text-xs text-muted">950 users</span>
            </div>
            <div class="flex-1 h-12 bg-slate-800 rounded-r-md rounded-l-sm relative overflow-hidden flex items-center">
              <div class="absolute inset-y-0 left-0 bg-emerald-500/80 transition-all duration-1000 ease-out" style="width: 76.0%"></div>
              <span class="relative z-10 ml-4 font-bold text-white">76.0%</span>
            </div>
          </div>

          <div class="w-full flex items-center gap-4 group">
            <div class="w-32 text-right">
              <span class="text-sm font-bold text-main block">Passed</span>
              <span class="text-xs text-muted">620 users</span>
            </div>
            <div class="flex-1 h-12 bg-slate-800 rounded-r-md rounded-l-sm relative overflow-hidden flex items-center">
              <div class="absolute inset-y-0 left-0 bg-brand transition-all duration-1000 ease-out" style="width: 49.6%"></div>
              <span class="relative z-10 ml-4 font-bold text-white">49.6%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CompletionMetricsPageComponent {}