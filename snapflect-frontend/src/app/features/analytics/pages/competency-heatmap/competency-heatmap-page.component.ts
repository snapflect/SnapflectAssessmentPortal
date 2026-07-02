import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-competency-heatmap-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Competency Heatmap</h2>
          <p class="text-muted text-sm mt-1">Identify skill gaps and proficiencies across candidate cohorts.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center text-xs text-muted">
            <span class="mr-2">Score:</span>
            <div class="w-4 h-4 rounded bg-rose-500/20 mr-1"></div><span class="mr-3">&lt;50%</span>
            <div class="w-4 h-4 rounded bg-amber-500/40 mr-1"></div><span class="mr-3">50-75%</span>
            <div class="w-4 h-4 rounded bg-emerald-500/60 mr-1"></div><span class="mr-3">75-90%</span>
            <div class="w-4 h-4 rounded bg-emerald-500 mr-1"></div><span>90%+</span>
          </div>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="glass-card flex-1 p-6 flex flex-col overflow-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th class="p-3 text-sm font-semibold text-main w-1/4 border-b border-border/50">Cohort / Role Group</th>
              <th *ngFor="let comp of competencies" class="p-3 text-xs font-semibold text-muted text-center uppercase tracking-wider border-b border-border/50 border-l border-border/20">
                <div class="writing-mode-vertical min-h-[120px] flex items-end justify-center pb-2">
                  <span class="-rotate-45 origin-left inline-block whitespace-nowrap ml-4">{{ comp }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of heatmapData; let i = index" class="border-b border-border/20 hover:bg-white/5 transition-colors">
              <td class="p-3 text-sm font-medium text-main">{{ row.cohort }}</td>
              <td *ngFor="let score of row.scores" class="p-1 border-l border-border/20">
                <div class="w-full h-12 rounded flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm"
                     [ngClass]="getScoreColor(score)"
                     [title]="'Average Score: ' + score + '%'">
                  {{ score }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .writing-mode-vertical {
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
  `]
})
export class CompetencyHeatmapPageComponent {
  competencies = [
    'Frontend Architecture',
    'State Management',
    'UI/UX Implementation',
    'Backend API Design',
    'Database Optimization',
    'DevOps & CI/CD',
    'System Design',
    'Security Fundamentals'
  ];

  heatmapData = [
    { cohort: 'Q1 Junior Developer Cohort', scores: [45, 62, 78, 55, 42, 30, 25, 60] },
    { cohort: 'Q1 Senior Developer Cohort', scores: [92, 88, 85, 95, 90, 82, 88, 94] },
    { cohort: 'Campus Hire Program 2026', scores: [58, 65, 82, 70, 68, 45, 30, 55] },
    { cohort: 'Internal Promotion Pool', scores: [85, 78, 80, 88, 85, 70, 75, 82] },
    { cohort: 'Contractor Batch A', scores: [75, 80, 85, 60, 55, 40, 50, 65] },
  ];

  getScoreColor(score: number): string {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 75) return 'bg-emerald-500/60 text-emerald-50';
    if (score >= 50) return 'bg-amber-500/40 text-amber-100';
    return 'bg-rose-500/20 text-rose-300';
  }
}