import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-date-range',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-4">
      <div class="flex flex-col">
        <label for="start-date" class="text-sm font-medium text-gray-700">Start Date</label>
        <input type="date" id="start-date" [ngModel]="startDate" (ngModelChange)="onStartDateChange($event)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      </div>
      <div class="flex flex-col">
        <label for="end-date" class="text-sm font-medium text-gray-700">End Date</label>
        <input type="date" id="end-date" [ngModel]="endDate" (ngModelChange)="onEndDateChange($event)" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      </div>
    </div>
  `
})
export class ReportDateRangeComponent {
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  @Output() dateRangeChange = new EventEmitter<{ startDate: string | null, endDate: string | null }>();

  onStartDateChange(date: string) {
    this.startDate = date;
    this.emitChange();
  }

  onEndDateChange(date: string) {
    this.endDate = date;
    this.emitChange();
  }

  private emitChange() {
    this.dateRangeChange.emit({ startDate: this.startDate, endDate: this.endDate });
  }
}