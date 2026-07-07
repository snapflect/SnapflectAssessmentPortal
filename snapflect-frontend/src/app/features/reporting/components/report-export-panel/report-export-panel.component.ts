import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-export-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <button (click)="onExportCsv()" class="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors">
        Export CSV
      </button>
      <button (click)="onExportPdf()" class="px-4 py-2 bg-white text-brand border border-brand text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors">
        Export PDF
      </button>
    </div>
  `
})
export class ReportExportPanelComponent {
  @Output() exportCsv = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();

  onExportCsv() {
    this.exportCsv.emit();
  }

  onExportPdf() {
    this.exportPdf.emit();
  }
}