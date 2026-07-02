import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center text-center p-8">
      <div class="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6 border border-brand/20">
        <svg class="w-10 h-10 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-white mb-2">Billing & Invoicing</h2>
      <p class="text-slate-400 max-w-lg mx-auto">
        This module is currently under development. Soon, you will be able to view your invoice history, manage payment methods, and monitor subscription usage directly from here.
      </p>
      
      <div class="mt-8 flex gap-4 opacity-50">
        <button class="btn-primary" disabled>View Current Usage</button>
        <button class="btn-secondary" disabled>Update Payment Method</button>
      </div>
    </div>
  `
})
export class BillingPageComponent {}
