import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Invoice {
  date: string;
  id: string;
  amount: string;
  status: string;
}

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-main">Invoice History</h2>
          <p class="text-muted text-sm mt-1">View and download your past billing invoices.</p>
        </div>
      </div>

      <div class="bg-card flex-1 p-6 border border-border-light shadow-lg rounded-xl">
        <div class="flex justify-between items-center mb-6">
           <h3 class="font-bold text-main">
             <ng-container *ngIf="selectedInvoices.size === 0">All Invoices</ng-container>
             <ng-container *ngIf="selectedInvoices.size > 0">{{ selectedInvoices.size }} Selected</ng-container>
           </h3>
           <button (click)="downloadSelected()" class="text-sm text-brand-light hover:underline flex items-center gap-1 font-medium bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             {{ selectedInvoices.size === 0 ? 'Download All (CSV)' : 'Download Selected (CSV)' }}
           </button>
        </div>
        
        <div class="table-responsive">
          <table class="w-full text-left border-collapse min-w-[600px]">
             <thead>
               <tr class="bg-input-bg">
                 <th class="p-4 w-12 rounded-tl-lg border-b border-border-light">
                   <input type="checkbox" 
                          [checked]="allSelected"
                          [indeterminate]="partialSelected"
                          (change)="toggleAll()"
                          class="w-4 h-4 rounded border-border-light bg-card text-brand focus:ring-brand/50 cursor-pointer">
                 </th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Date</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Invoice No.</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Amount</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light">Status</th>
                 <th class="p-4 text-sm font-semibold text-muted border-b border-border-light text-right rounded-tr-lg">Receipt</th>
               </tr>
             </thead>
             <tbody>
               <tr *ngFor="let invoice of invoices" 
                   class="border-b border-border-light hover:bg-input-bg transition-colors group cursor-pointer"
                   [ngClass]="{'bg-brand/5': selectedInvoices.has(invoice.id)}"
                   (click)="toggleSelection(invoice.id, $event)">
                 <td class="p-4">
                   <input type="checkbox" 
                          [checked]="selectedInvoices.has(invoice.id)"
                          class="w-4 h-4 rounded border-border-light bg-card text-brand focus:ring-brand/50 cursor-pointer"
                          (click)="$event.stopPropagation()"
                          (change)="toggleSelection(invoice.id, $event)">
                 </td>
                 <td class="p-4 text-sm text-main font-medium">{{ invoice.date }}</td>
                 <td class="p-4 text-sm text-muted font-mono">{{ invoice.id }}</td>
                 <td class="p-4 text-sm font-medium text-main">{{ invoice.amount }}</td>
                 <td class="p-4">
                   <span class="px-3 py-1 text-xs font-semibold rounded-full" 
                         [ngClass]="invoice.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'">
                     {{ invoice.status }}
                   </span>
                 </td>
                 <td class="p-4 text-right">
                   <button (click)="downloadSingle(invoice, $event)" class="text-brand-light opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full" title="Download CSV">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   </button>
                 </td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class InvoicesPageComponent {
  invoices: Invoice[] = [
    { date: 'Jan 1, 2026', id: 'INV-2026-001', amount: '$12,000.00', status: 'Paid' },
    { date: 'Jan 1, 2025', id: 'INV-2025-001', amount: '$12,000.00', status: 'Paid' },
    { date: 'Jan 1, 2024', id: 'INV-2024-001', amount: '$10,500.00', status: 'Paid' },
    { date: 'Jan 1, 2023', id: 'INV-2023-001', amount: '$10,500.00', status: 'Paid' },
  ];

  selectedInvoices = new Set<string>();

  get allSelected(): boolean {
    return this.invoices.length > 0 && this.selectedInvoices.size === this.invoices.length;
  }

  get partialSelected(): boolean {
    return this.selectedInvoices.size > 0 && this.selectedInvoices.size < this.invoices.length;
  }

  toggleAll() {
    if (this.allSelected) {
      this.selectedInvoices.clear();
    } else {
      this.invoices.forEach(inv => this.selectedInvoices.add(inv.id));
    }
  }

  toggleSelection(id: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.selectedInvoices.has(id)) {
      this.selectedInvoices.delete(id);
    } else {
      this.selectedInvoices.add(id);
    }
  }

  downloadSingle(invoice: Invoice, event: Event) {
    event.stopPropagation();
    this.generateCsv([invoice]);
  }

  downloadSelected() {
    const listToDownload = this.selectedInvoices.size === 0 
      ? this.invoices 
      : this.invoices.filter(inv => this.selectedInvoices.has(inv.id));
      
    this.generateCsv(listToDownload);
  }

  private generateCsv(invoices: Invoice[]) {
    if (invoices.length === 0) return;
    
    // Header row
    const headers = ['Date', 'Invoice No', 'Amount', 'Status'];
    const rows = invoices.map(inv => [
      inv.date,
      inv.id,
      inv.amount.replace(/,/g, ''), // remove commas from amount for CSV safety
      inv.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = invoices.length === 1 
      ? `${invoices[0].id}.csv` 
      : `snapflect-invoices-${new Date().getTime()}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
