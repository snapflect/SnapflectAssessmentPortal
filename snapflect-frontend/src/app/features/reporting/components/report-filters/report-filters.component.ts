import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-4">
      <div class="flex flex-col">
        <label for="status-filter" class="text-sm font-medium text-gray-700">Status</label>
        <select id="status-filter" [ngModel]="selectedStatus" (ngModelChange)="onStatusChange($event)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option value="">All</option>
          <option *ngFor="let status of availableStatuses" [value]="status">{{ status }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="search-input" class="text-sm font-medium text-gray-700">Search</label>
        <input type="text" id="search-input" [ngModel]="searchQuery" (ngModelChange)="onSearchChange($event)" placeholder="Search..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      </div>
    </div>
  `
})
export class ReportFiltersComponent {
  @Input() availableStatuses: string[] = [];
  @Input() selectedStatus: string = '';
  @Input() searchQuery: string = '';
  @Output() filtersChange = new EventEmitter<{ status: string, search: string }>();

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.emitChange();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.emitChange();
  }

  private emitChange() {
    this.filtersChange.emit({ status: this.selectedStatus, search: this.searchQuery });
  }
}