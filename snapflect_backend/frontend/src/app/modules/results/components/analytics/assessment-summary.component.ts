import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFacade } from '../../facades/analytics.facade';

@Component({
  selector: 'app-assessment-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      
      <!-- Total Attempts KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Attempts</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ store.totalAttempts() }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Pass Rate KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pass Rate</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ store.passRatePercentage() | number:'1.0-1' }}%</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Average Score KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ store.averageScorePercentage() | number:'1.0-1' }}%</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Competency KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <dt class="text-sm font-medium text-gray-500 truncate mb-1">Top Competency</dt>
          <dd class="text-lg font-semibold text-gray-900 truncate">
            {{ store.topCompetency()?.competencyName || 'N/A' }}
          </dd>
          <div class="text-sm text-green-600 mt-1">{{ store.topCompetency()?.averagePercentage | number:'1.0-1' }}% Avg</div>
        </div>
      </div>

      <!-- Weakest Competency KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <dt class="text-sm font-medium text-gray-500 truncate mb-1">Weakest Competency</dt>
          <dd class="text-lg font-semibold text-gray-900 truncate">
            {{ store.weakestCompetency()?.competencyName || 'N/A' }}
          </dd>
          <div class="text-sm text-red-600 mt-1">{{ store.weakestCompetency()?.averagePercentage | number:'1.0-1' }}% Avg</div>
        </div>
      </div>

      <!-- Most Failed Question KPI -->
      <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
        <div class="p-5">
          <dt class="text-sm font-medium text-gray-500 truncate mb-1">Most Failed Question</dt>
          <dd class="text-sm font-medium text-gray-900 truncate">
            {{ store.mostFailedQuestion()?.questionExcerpt || 'N/A' }}
          </dd>
          <div class="text-sm text-red-600 mt-1">{{ store.mostFailedQuestion()?.passRatePercentage | number:'1.0-1' }}% Pass Rate</div>
        </div>
      </div>

    </div>
  `
})
export class AssessmentSummaryComponent {
  private facade = inject(AnalyticsFacade);
  public store = this.facade.store;
}
