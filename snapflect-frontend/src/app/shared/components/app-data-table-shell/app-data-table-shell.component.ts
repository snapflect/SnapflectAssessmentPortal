import { Component, input, output, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card flex-1 overflow-hidden flex flex-col min-h-0">
      
      <!-- Search Bar -->
      <div class="p-4 border-b border-border-light flex justify-between items-center bg-input-bg" *ngIf="showSearch()">
        <div class="relative w-64">
          <svg class="w-5 h-5 absolute left-3 top-2.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input type="text" 
                 [ngModel]="searchTerm()" 
                 (ngModelChange)="onSearchTermChange($event)" 
                 class="input-field pl-10 py-2 text-sm bg-surface" 
                 [placeholder]="searchPlaceholder()">
        </div>
        <ng-content select="[toolbar-actions]"></ng-content>
      </div>

      <!-- Table Wrapper -->
      <div class="overflow-auto flex-1 custom-scrollbar">
        <table class="w-full text-left text-sm text-muted">
          <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm border-b border-border-light">
            <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          </thead>
          <tbody [class.opacity-50]="loading()" [class.pointer-events-none]="loading()" class="transition-opacity duration-300">
            
            <!-- Loading State -->
            <tr *ngIf="loading() && items().length === 0">
              <td colspan="100%" class="px-6 py-12 text-center text-muted">
                <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading data...
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="!loading() && items().length === 0">
              <td colspan="100%" class="px-6 py-12 text-center text-muted bg-surface/30">
                <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border-light">
                  <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                {{ emptyMessage() }}
              </td>
            </tr>

            <!-- Data Rows -->
            <ng-container *ngFor="let item of items()">
              <ng-container *ngTemplateOutlet="rowTemplate; context: {$implicit: item}"></ng-container>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep tbody > tr {
      @apply border-b border-border-light hover:bg-surface-light transition-colors;
    }
    ::ng-deep tbody > tr > td {
      @apply px-6 py-4;
    }
    ::ng-deep thead > tr > th {
      @apply px-6 py-4 font-medium;
    }
  `]
})
export class DataTableShellComponent {
  loading = input<boolean>(false);
  items = input<any[]>([]);
  showSearch = input<boolean>(true);
  searchTerm = input<string>('');
  searchPlaceholder = input<string>('Search...');
  emptyMessage = input<string>('No records found.');

  searchTermChange = output<string>();

  @ContentChild('header', { static: false }) headerTemplate!: TemplateRef<any>;
  @ContentChild('row', { static: false }) rowTemplate!: TemplateRef<any>;

  onSearchTermChange(value: string) {
    this.searchTermChange.emit(value);
  }
}
