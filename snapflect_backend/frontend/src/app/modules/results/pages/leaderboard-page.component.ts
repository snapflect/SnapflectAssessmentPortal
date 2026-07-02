import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardFacade } from '../../facades/leaderboard.facade';
import { LeaderboardTableComponent } from '../components/leaderboard/leaderboard-table.component';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule, LeaderboardTableComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Cohort Leaderboard</h1>
        <p class="mt-2 text-sm text-gray-500">Ranking based on overall score and completion speed.</p>
      </div>

      @if (store.error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Leaderboard Unavailable</h3>
              <p class="mt-2 text-sm text-red-700">{{ store.error().detail || 'The leaderboard is currently disabled or unavailable for this cohort.' }}</p>
            </div>
          </div>
        </div>
      }

      @if (store.isLoading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (!store.isLoading() && store.entries().length > 0) {
        
        <!-- Current User Highlight Widget -->
        @if (store.currentUserEntry()) {
          <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-indigo-900">Your Current Standing</h3>
              <p class="text-sm text-indigo-700 mt-1">You placed #{{ store.currentUserEntry()?.rank }} out of {{ store.entries().length }} passing candidates.</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-black text-indigo-600">{{ store.currentUserEntry()?.score | number:'1.0-1' }}%</div>
            </div>
          </div>
        }

        <!-- Main Leaderboard Table -->
        <app-leaderboard-table></app-leaderboard-table>
      }
    </div>
  `
})
export class LeaderboardPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(LeaderboardFacade);
  public store = this.facade.store;

  ngOnInit(): void {
    const assessmentUuid = this.route.snapshot.paramMap.get('assessmentUuid');
    if (assessmentUuid) {
      this.facade.loadLeaderboard(assessmentUuid);
    }
  }
}
