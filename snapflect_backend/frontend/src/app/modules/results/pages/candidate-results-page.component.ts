import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ResultsFacade } from '../../facades/results.facade';
import { CompetencyBreakdownComponent } from '../competency-breakdown/competency-breakdown.component';

@Component({
  selector: 'app-candidate-results-page',
  standalone: true,
  imports: [CommonModule, CompetencyBreakdownComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6 mt-8">
      @if (store.isLoading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (store.error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ store.error().title || 'Error Loading Results' }}</h3>
              <p class="mt-2 text-sm text-red-700">{{ store.error().detail || 'An unexpected error occurred.' }}</p>
            </div>
          </div>
        </div>
      }

      @if (!store.isLoading() && store.activeResult()) {
        <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <!-- Header Area -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center text-white">
            <h1 class="text-3xl font-bold mb-2">{{ store.activeResult()?.assessmentName }}</h1>
            <p class="text-indigo-100">Attempt completed on {{ store.activeResult()?.publishedAt | date:'mediumDate' }}</p>
          </div>

          <!-- Main Metrics Area -->
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <!-- Score Display (Honors Visibility Rule) -->
              @if (store.isScoreVisible()) {
                <div class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <span class="text-gray-500 font-medium text-sm uppercase tracking-wider mb-2">Overall Score</span>
                  <div class="text-5xl font-extrabold text-indigo-700 mb-1">
                    {{ store.activeResult()?.percentage }}<span class="text-2xl text-indigo-400">%</span>
                  </div>
                  <span class="text-gray-400 text-sm">({{ store.activeResult()?.score }} points)</span>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <span class="text-gray-500 font-medium text-sm mb-2">Assessment Completed</span>
                  <p class="text-gray-400 text-sm">Your scores have been recorded successfully. Score visibility is restricted by the assessment administrator.</p>
                </div>
              }

              <!-- Pass/Fail Display (Honors Visibility Rule) -->
              @if (store.isPassFailVisible()) {
                <div class="flex flex-col items-center justify-center p-6 rounded-lg border"
                     [ngClass]="store.activeResult()?.passFailStatus === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
                  <span class="font-medium text-sm uppercase tracking-wider mb-2"
                        [ngClass]="store.activeResult()?.passFailStatus === 'PASS' ? 'text-green-700' : 'text-red-700'">
                    Outcome
                  </span>
                  <div class="text-4xl font-extrabold"
                       [ngClass]="store.activeResult()?.passFailStatus === 'PASS' ? 'text-green-600' : 'text-red-600'">
                    {{ store.activeResult()?.passFailStatus }}
                  </div>
                </div>
              }
            </div>

            <!-- Competency Breakdown -->
            <app-competency-breakdown></app-competency-breakdown>
          </div>
        </div>
      }
    </div>
  `
})
export class CandidateResultsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(ResultsFacade);
  public store = this.facade.store;

  ngOnInit(): void {
    const resultUuid = this.route.snapshot.paramMap.get('resultUuid');
    if (resultUuid) {
      this.facade.loadResult(resultUuid);
    }
  }
}
