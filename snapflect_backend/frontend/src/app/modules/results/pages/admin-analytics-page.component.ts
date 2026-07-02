import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsFacade } from '../../facades/analytics.facade';
import { AssessmentSummaryComponent } from '../components/analytics/assessment-summary.component';
import { CompetencyHeatmapComponent } from '../components/analytics/competency-heatmap.component';
import { QuestionDifficultyComponent } from '../components/analytics/question-difficulty.component';

@Component({
  selector: 'app-admin-analytics-page',
  standalone: true,
  imports: [
    CommonModule, 
    AssessmentSummaryComponent, 
    CompetencyHeatmapComponent, 
    QuestionDifficultyComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900">Assessment Analytics</h1>
          <p class="mt-2 text-sm text-gray-500">Global cohort performance metrics and competency trends.</p>
        </div>
        <div class="text-sm text-gray-500 flex items-center">
          <span class="relative flex h-3 w-3 mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Materialized View
        </div>
      </div>

      @if (store.isLoading()) {
        <div class="flex justify-center p-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (store.error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Analytics Loading Failed</h3>
              <p class="mt-2 text-sm text-red-700">{{ store.error().detail || 'An unexpected error occurred.' }}</p>
            </div>
          </div>
        </div>
      }

      @if (!store.isLoading() && store.assessmentSummary()) {
        <!-- KPI Row -->
        <app-assessment-summary></app-assessment-summary>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column: Competency Heatmap -->
          <div class="flex flex-col">
            <app-competency-heatmap class="h-full"></app-competency-heatmap>
          </div>
          
          <!-- Right Column: Question Difficulty Analysis -->
          <div class="flex flex-col">
            <app-question-difficulty class="h-full"></app-question-difficulty>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminAnalyticsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(AnalyticsFacade);
  public store = this.facade.store;

  ngOnInit(): void {
    const assessmentUuid = this.route.snapshot.paramMap.get('assessmentUuid');
    if (assessmentUuid) {
      this.facade.loadDashboard(assessmentUuid);
    }
  }
}
