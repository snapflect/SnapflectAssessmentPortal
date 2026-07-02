import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardFacade } from '../../facades/leaderboard.facade';

@Component({
  selector: 'app-leaderboard-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (entry of store.entries(); track entry.rank) {
              <tr [ngClass]="entry.isCurrentUser ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    @if (entry.rank === 1) {
                      <span class="text-2xl" title="1st Place">🥇</span>
                    } @else if (entry.rank === 2) {
                      <span class="text-2xl" title="2nd Place">🥈</span>
                    } @else if (entry.rank === 3) {
                      <span class="text-2xl" title="3rd Place">🥉</span>
                    } @else {
                      <span class="text-sm font-medium text-gray-900 ml-2">#{{ entry.rank }}</span>
                    }
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium" [ngClass]="entry.isCurrentUser ? 'text-indigo-700' : 'text-gray-900'">
                    {{ entry.candidateName }}
                    @if (entry.isCurrentUser) {
                      <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        You
                      </span>
                    }
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span class="text-sm font-semibold text-gray-900">{{ entry.score | number:'1.0-1' }}%</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {{ formatTime(entry.timeTakenSeconds) }}
                </td>
              </tr>
            }

            @if (store.entries().length === 0 && !store.isLoading()) {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500 italic">
                  No rankings available or leaderboard is disabled.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (store.entries().length > 0) {
        <div class="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-right">
          Ranking as of: {{ store.entries()[0].rankSnapshotDate | date:'medium' }}
        </div>
      }
    </div>
  `
})
export class LeaderboardTableComponent {
  private facade = inject(LeaderboardFacade);
  public store = this.facade.store;

  public formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
