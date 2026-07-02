import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFacade } from '../../facades/analytics.facade';

@Component({
  selector: 'app-competency-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg border border-gray-100 p-6 mb-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Competency Heatmap</h3>
      
      <div class="space-y-3">
        @for (comp of store.competencySummaries(); track comp.competencyUuid) {
          <div class="flex items-center">
            <div class="w-32 text-sm font-medium text-gray-700 truncate pr-4">
              {{ comp.competencyName }}
            </div>
            <div class="flex-1">
              <div class="w-full bg-gray-200 rounded-sm h-6 relative overflow-hidden group">
                <div class="h-6 transition-all duration-500 ease-out"
                     [ngClass]="getHeatmapColor(comp.averagePercentage)"
                     [style.width.%]="comp.averagePercentage">
                </div>
                <div class="absolute inset-0 flex items-center justify-end pr-2 text-xs font-bold"
                     [ngClass]="comp.averagePercentage > 50 ? 'text-white' : 'text-gray-700'">
                  {{ comp.averagePercentage | number:'1.0-1' }}%
                </div>
              </div>
            </div>
          </div>
        }

        @if (store.competencySummaries().length === 0 && !store.isLoading()) {
          <div class="text-sm text-gray-500 italic py-4">No competency data available for this cohort.</div>
        }
      </div>
    </div>
  `
})
export class CompetencyHeatmapComponent {
  private facade = inject(AnalyticsFacade);
  public store = this.facade.store;

  // Returns tailwind color classes based on the percentage
  public getHeatmapColor(percentage: number): string {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-400';
    if (percentage >= 60) return 'bg-orange-400';
    return 'bg-red-500';
  }
}
