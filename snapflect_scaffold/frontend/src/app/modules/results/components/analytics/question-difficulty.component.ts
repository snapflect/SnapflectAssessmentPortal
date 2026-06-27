import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFacade } from '../../facades/analytics.facade';

@Component({
  selector: 'app-question-difficulty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg border border-gray-100 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-900">Question Difficulty Analysis</h3>
        <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Sorted by lowest pass rate</span>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question Excerpt</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Responses</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (question of store.questionSummaries(); track question.questionUuid) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 truncate max-w-md" [title]="question.questionExcerpt">
                    {{ question.questionExcerpt }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {{ question.totalResponses }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="getPassRateClass(question.passRatePercentage)">
                    {{ question.passRatePercentage | number:'1.0-1' }}%
                  </span>
                </td>
              </tr>
            }

            @if (store.questionSummaries().length === 0 && !store.isLoading()) {
              <tr>
                <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-500 italic">
                  No question analytics available for this cohort.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class QuestionDifficultyComponent {
  private facade = inject(AnalyticsFacade);
  public store = this.facade.store;

  public getPassRateClass(percentage: number): string {
    if (percentage < 30) return 'bg-red-100 text-red-800 border border-red-200';
    if (percentage < 60) return 'bg-orange-100 text-orange-800 border border-orange-200';
    if (percentage < 80) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    return 'bg-green-100 text-green-800 border border-green-200';
  }
}
