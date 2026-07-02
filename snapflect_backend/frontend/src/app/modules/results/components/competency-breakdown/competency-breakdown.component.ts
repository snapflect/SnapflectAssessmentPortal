import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsFacade } from '../../facades/results.facade';

@Component({
  selector: 'app-competency-breakdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.hasCompetencies()) {
      <div class="competency-container p-6 bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Competency Breakdown</h3>
        
        <div class="space-y-4">
          @for (comp of store.activeCompetencies(); track comp.competencyUuid) {
            <div class="competency-row">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700">{{ comp.competencyName }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold" [ngClass]="comp.passed ? 'text-green-600' : 'text-red-600'">
                    {{ comp.percentage }}%
                  </span>
                  @if (comp.passed) {
                    <span class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Pass</span>
                  } @else {
                    <span class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Fail</span>
                  }
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="h-2.5 rounded-full" 
                     [ngClass]="comp.passed ? 'bg-green-500' : 'bg-red-500'" 
                     [style.width.%]="comp.percentage">
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class CompetencyBreakdownComponent {
  private facade = inject(ResultsFacade);
  public store = this.facade.store;
}
