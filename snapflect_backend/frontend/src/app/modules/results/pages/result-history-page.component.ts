import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultsFacade } from '../../facades/results.facade';

@Component({
  selector: 'app-result-history-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto p-6 mt-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Assessment History</h1>
      </div>

      @if (store.isLoading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (!store.isLoading() && store.history().length === 0) {
        <div class="text-center bg-gray-50 border border-gray-200 rounded-lg p-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No Assessment History</h3>
          <p class="mt-1 text-sm text-gray-500">You have not completed any assessments yet, or results are not published.</p>
        </div>
      }

      @if (!store.isLoading() && store.history().length > 0) {
        <div class="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul role="list" class="divide-y divide-gray-200">
            @for (item of store.history(); track item.resultUuid) {
              <li>
                <a [routerLink]="['/candidate/results', item.resultUuid]" class="block hover:bg-gray-50 transition-colors duration-150">
                  <div class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-indigo-600 truncate">{{ item.assessmentName }}</p>
                      <div class="ml-2 flex-shrink-0 flex gap-2">
                        @if (item.passFailStatus) {
                          <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                             [ngClass]="item.passFailStatus === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{ item.passFailStatus }}
                          </p>
                        }
                      </div>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="flex items-center text-sm text-gray-500">
                          <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Completed on {{ item.attemptDate | date:'mediumDate' }}
                        </p>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        @if (item.percentage !== null) {
                          <span class="font-medium text-gray-900">Score: {{ item.percentage }}%</span>
                        } @else {
                          <span class="italic">Score visibility restricted</span>
                        }
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `
})
export class ResultHistoryPageComponent implements OnInit {
  private facade = inject(ResultsFacade);
  public store = this.facade.store;

  ngOnInit(): void {
    // Default load first page
    this.facade.loadHistory(1);
  }
}
