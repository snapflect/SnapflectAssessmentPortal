import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UserStore } from '../../../../shared/stores/user.store';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SubscriptionPlan {
  id: number;
  plan_code: string;
  plan_name: string;
  price: number;
  max_assessments: number | null;
  features: string;
}

interface TenantSubscription {
  id: number;
  uuid: string;
  organization_id: number;
  plan_id: number;
  status: string;
  starts_at: string;
  ends_at: string | null;
  assessments_used: number;
  plan?: SubscriptionPlan;
}

interface Invoice {
  id: number;
  uuid: string;
  organization_id: number;
  organization_name?: string;
  tenant_subscription_id: number;
  invoice_number: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_date: string;
  payment_reference: string | null;
}

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-main">Billing & Subscription</h2>
        <p class="text-muted text-sm mt-1">Manage your active subscription plan and view invoices.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <!-- Platform Admin View: Master Clients List -->
        <div *ngIf="isPlatformAdmin" class="glass-card p-6 lg:col-span-3 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-bl-full -mr-8 -mt-8"></div>
          <h3 class="text-lg font-medium text-main mb-4">Client Subscriptions Overview</h3>
          
          <div *ngIf="loadingSubscription" class="animate-pulse space-y-4">
            <div class="h-4 bg-slate-700/50 rounded w-1/4"></div>
            <div class="h-8 bg-slate-700/50 rounded w-full"></div>
            <div class="h-8 bg-slate-700/50 rounded w-full"></div>
          </div>

          <div *ngIf="!loadingSubscription && clients.length > 0" class="overflow-auto max-h-96">
            <table class="w-full text-left text-sm text-muted">
              <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
                <tr>
                  <th class="px-4 py-3">Organization</th>
                  <th class="px-4 py-3">Plan</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Assessments Used</th>
                  <th class="px-4 py-3 text-right">MRR</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let client of clients" class="border-b border-white/5 hover:bg-white/5">
                  <td class="px-4 py-3 font-medium text-brand-light">{{ client.organization_name }}</td>
                  <td class="px-4 py-3">{{ client.current_subscription?.plan?.plan_name || 'No Plan' }}</td>
                  <td class="px-4 py-3">
                    <span *ngIf="client.current_subscription" class="px-2 py-0.5 rounded text-xs font-medium"
                          [ngClass]="{'bg-green-500/10 text-green-400': client.current_subscription.status === 'ACTIVE', 'bg-blue-500/10 text-blue-400': client.current_subscription.status === 'TRIALING', 'bg-red-500/10 text-red-400': client.current_subscription.status === 'PAST_DUE'}">
                      {{ client.current_subscription.status }}
                    </span>
                    <span *ngIf="!client.current_subscription" class="px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400">INACTIVE</span>
                  </td>
                  <td class="px-4 py-3">{{ client.current_subscription?.assessments_used || 0 }} / {{ client.current_subscription?.plan?.included_assessments ? client.current_subscription.plan.included_assessments : 'Unlimited' }}</td>
                  <td class="px-4 py-3 text-right text-main font-medium">₹{{ client.current_subscription?.plan?.price || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngIf="!loadingSubscription && clients.length === 0" class="text-muted italic py-4">
            No client organizations found.
          </div>
        </div>

        <!-- Client View: Current Plan Card -->
        <div *ngIf="!isPlatformAdmin" class="glass-card p-6 lg:col-span-2 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-bl-full -mr-8 -mt-8"></div>
          
          <h3 class="text-lg font-medium text-main mb-4">Current Subscription</h3>
          
          <div *ngIf="loadingSubscription" class="animate-pulse space-y-4">
            <div class="h-4 bg-slate-700/50 rounded w-1/4"></div>
            <div class="h-8 bg-slate-700/50 rounded w-1/2"></div>
            <div class="h-4 bg-slate-700/50 rounded w-1/3"></div>
          </div>
          
          <div *ngIf="!loadingSubscription && subscription">
            <div class="flex items-center space-x-4 mb-6">
              <div class="p-3 bg-brand-light/10 rounded-lg">
                <svg class="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-main">{{ subscription.plan?.plan_name || 'Unknown Plan' }}</h4>
                <div class="flex items-center mt-1">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        [ngClass]="{'bg-green-500/10 text-green-400': subscription.status === 'ACTIVE', 'bg-blue-500/10 text-blue-400': subscription.status === 'TRIALING', 'bg-red-500/10 text-red-400': subscription.status === 'PAST_DUE'}">
                    {{ subscription.status }}
                  </span>
                  <span class="text-xs text-muted ml-3" *ngIf="subscription.ends_at">
                    Renews/Expires on {{ subscription.ends_at | date:'mediumDate' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
              <div>
                <p class="text-xs text-muted mb-1">Assessments Used</p>
                <p class="text-lg font-medium text-main">
                  {{ subscription.assessments_used }} 
                  <span class="text-sm text-muted">/ {{ subscription.plan?.max_assessments ? subscription.plan?.max_assessments : 'Unlimited' }}</span>
                </p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Plan Price</p>
                <p class="text-lg font-medium text-main">₹{{ subscription.plan?.price || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div *ngIf="!loadingSubscription && !subscription" class="text-muted italic py-4">
            No active subscription found for this organization.
          </div>
        </div>

        <!-- Need Help Card (Only for Clients) -->
        <div *ngIf="!isPlatformAdmin" class="glass-card p-6 flex flex-col justify-center text-center">
          <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-main mb-2">Upgrade or Change Plan?</h3>
          <p class="text-sm text-muted mb-4">Contact your platform administrator or account manager to modify your subscription.</p>
          <button class="btn-secondary w-full" onclick="window.location.href='mailto:support@snapflect.com'">Contact Support</button>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="glass-card flex-1 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-border-light">
          <h3 class="text-lg font-medium text-main">Billing History</h3>
        </div>
        
        <div class="overflow-auto flex-1">
          <table class="w-full text-left text-sm text-muted">
            <thead class="text-xs text-muted uppercase bg-card sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium text-brand-light" *ngIf="isPlatformAdmin">Organization</th>
                <th scope="col" class="px-6 py-4 font-medium">Invoice #</th>
                <th scope="col" class="px-6 py-4 font-medium">Date</th>
                <th scope="col" class="px-6 py-4 font-medium">Amount</th>
                <th scope="col" class="px-6 py-4 font-medium">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody [class.opacity-50]="loadingInvoices" [class.pointer-events-none]="loadingInvoices" class="transition-opacity duration-300">
              <tr *ngIf="loadingInvoices && invoices.length === 0">
                <td [attr.colspan]="isPlatformAdmin ? 6 : 5" class="px-6 py-12 text-center text-muted">
                  <svg class="animate-spin h-8 w-8 mx-auto text-brand-light mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading billing history...
                </td>
              </tr>
              <tr *ngIf="!loadingInvoices && invoices.length === 0">
                <td [attr.colspan]="isPlatformAdmin ? 6 : 5" class="px-6 py-12 text-center text-slate-500">
                  No invoices found.
                </td>
              </tr>
              <tr *ngFor="let invoice of invoices" class="border-b border-white/5 hover:hover:brightness-110 transition-colors">
                <td class="px-6 py-4 font-medium" *ngIf="isPlatformAdmin">{{ invoice.organization_name }}</td>
                <td class="px-6 py-4 font-medium text-brand-light">{{ invoice.invoice_number }}</td>
                <td class="px-6 py-4">{{ invoice.created_date | date:'mediumDate' }}</td>
                <td class="px-6 py-4 font-medium text-main">₹{{ invoice.amount_due }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs font-medium"
                        [ngClass]="{'bg-green-500/10 text-green-400': invoice.status === 'PAID', 'bg-yellow-500/10 text-yellow-400': invoice.status === 'DRAFT', 'bg-red-500/10 text-red-400': invoice.status === 'OVERDUE'}">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-brand-light hover:text-brand transition-colors flex items-center justify-end w-full disabled:opacity-50" (click)="downloadInvoice(invoice)" [disabled]="generatingPdf">
                    <svg *ngIf="!generatingPdf || selectedInvoiceForPdf?.uuid !== invoice.uuid" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <svg *ngIf="generatingPdf && selectedInvoiceForPdf?.uuid === invoice.uuid" class="animate-spin w-4 h-4 mr-1 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ generatingPdf && selectedInvoiceForPdf?.uuid === invoice.uuid ? 'Generating...' : 'Download' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Hidden Premium Invoice Template for PDF Generation -->
      <div *ngIf="selectedInvoiceForPdf" class="fixed -left-[9999px] top-0 bg-white" style="width: 800px; min-height: 1100px;">
        <div id="pdf-invoice-template" class="w-full h-full bg-white relative p-12 flex flex-col" style="min-height: 1100px;">
          
          <!-- Outer Navy Border -->
          <div class="absolute inset-4 border-[8px] border-[#0a2342] z-10 pointer-events-none"></div>
          <!-- Inner Gold Border -->
          <div class="absolute inset-7 border-[2px] border-[#d4af37] z-10 pointer-events-none"></div>

          <div class="relative z-20 w-full flex flex-col h-full pt-4 px-4">
            
            <!-- Header -->
            <div class="flex justify-between items-start mb-8 border-b-2 border-[#d4af37] pb-6">
              <div>
                <h1 class="text-6xl font-serif tracking-wider uppercase mb-4" style="color: #0a2342; font-family: 'Playfair Display', serif; line-height: 1.2;">INVOICE</h1>
                <p class="text-slate-500 font-medium tracking-widest uppercase text-xs">Snapflect Assessment Portal</p>
              </div>
              <div class="text-right flex flex-col items-end">
                <div class="w-16 h-16 bg-[#0a2342] text-[#d4af37] rounded-full flex items-center justify-center shadow-md mb-3">
                  <span class="text-2xl font-serif font-bold" style="font-family: 'Playfair Display', serif;">S</span>
                </div>
                <p class="text-sm font-bold text-[#0a2342]">Invoice #{{ selectedInvoiceForPdf.invoice_number }}</p>
                <p class="text-xs text-slate-500 mt-1">Date: {{ selectedInvoiceForPdf.created_date | date:'longDate' }}</p>
              </div>
            </div>

            <!-- Billed To & Status -->
            <div class="flex justify-between mb-12">
              <div>
                <p class="text-xs text-[#d4af37] uppercase tracking-widest mb-2 font-bold">Billed To</p>
                <h2 class="text-3xl font-serif text-[#0a2342] mb-1" style="font-family: 'Playfair Display', serif;">{{ selectedInvoiceForPdf.organization_name || userStore.profile()?.organization_name || 'Your Organization' }}</h2>
                <p class="text-sm text-slate-500">{{ getPlanNameForInvoice(selectedInvoiceForPdf) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-[#d4af37] uppercase tracking-widest mb-2 font-bold">Status</p>
                <h3 class="text-3xl font-bold uppercase" 
                    [ngClass]="{'text-emerald-600': selectedInvoiceForPdf.status === 'PAID' || isInvoiceTrial(selectedInvoiceForPdf), 'text-amber-600': selectedInvoiceForPdf.status === 'DRAFT', 'text-rose-600': selectedInvoiceForPdf.status === 'OVERDUE'}">
                  {{ isInvoiceTrial(selectedInvoiceForPdf) ? 'TRIAL (FREE)' : selectedInvoiceForPdf.status }}
                </h3>
                <p class="text-sm text-slate-500 mt-1" *ngIf="selectedInvoiceForPdf.due_date">Due: {{ selectedInvoiceForPdf.due_date | date:'longDate' }}</p>
              </div>
            </div>

            <!-- Invoice Details Table -->
            <div class="w-full mb-12 flex-1">
              <table class="w-full text-left">
                <thead>
                  <tr class="border-b-2 border-slate-200">
                    <th class="py-3 text-xs text-[#0a2342] uppercase tracking-widest font-bold">Description</th>
                    <th class="py-3 text-xs text-[#0a2342] uppercase tracking-widest font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-100">
                    <td class="py-6 text-slate-800 font-medium text-lg">{{ subscription?.plan?.plan_name || 'Snapflect Assessment Subscription' }}</td>
                    <td class="py-6 text-right font-bold text-slate-800 text-lg">₹{{ selectedInvoiceForPdf.amount_due }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="w-1/2 ml-auto mb-16">
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-slate-600 font-medium">Subtotal</span>
                <span class="text-slate-800 font-bold text-lg">₹{{ selectedInvoiceForPdf.amount_due }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-slate-100">
                <span class="text-slate-600 font-medium">Amount Paid</span>
                <span class="text-emerald-600 font-bold text-lg">- ₹{{ selectedInvoiceForPdf.amount_paid }}</span>
              </div>
              <div class="flex justify-between py-4 border-b-2 border-[#0a2342] mt-2">
                <span class="text-[#0a2342] font-bold text-xl uppercase tracking-wider">Total Due</span>
                <span class="text-[#d4af37] font-bold text-3xl">₹{{ (selectedInvoiceForPdf.amount_due - selectedInvoiceForPdf.amount_paid) }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-auto pt-8 border-t border-slate-200 mb-4">
              <p class="text-slate-500 font-medium italic mb-2 font-serif" style="font-family: 'Playfair Display', serif;">Thank you for your business!</p>
              <p class="text-xs text-slate-400 tracking-wider">Snapflect Assessment Portal &bull; billing&#64;snapflect.com</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class BillingPageComponent implements OnInit {
  subscription: TenantSubscription | null = null;
  clients: any[] = [];
  invoices: any[] = [];
  
  loadingSubscription = true;
  loadingInvoices = true;
  generatingPdf = false;
  selectedInvoiceForPdf: Invoice | null = null;
  
  private http = inject(HttpClient);
  public userStore = inject(UserStore);

  get isPlatformAdmin(): boolean {
    const profile = this.userStore.profile();
    if (!profile) return false;
    
    return profile.roles?.includes('PLATFORM_ADMIN') || 
           profile.organization_name === 'System Platform' || 
           profile.organization_name === 'Snapflect Assessment Portal';
  }

  ngOnInit() {
    this.fetchSubscription();
    this.fetchInvoices();
  }

  fetchSubscription() {
    this.loadingSubscription = true;
    
    if (this.isPlatformAdmin) {
      this.http.get<any>(`${environment.apiUrl}/billing/admin/clients`)
        .subscribe({
          next: (response) => {
            this.clients = response.data;
            this.loadingSubscription = false;
          },
          error: (err) => {
            console.error('Error fetching clients', err);
            this.loadingSubscription = false;
          }
        });
    } else {
      this.http.get<any>(`${environment.apiUrl}/billing/subscriptions/current`)
        .subscribe({
          next: (response) => {
            this.subscription = response.data;
            this.loadingSubscription = false;
          },
          error: (err) => {
            console.error('Error fetching subscription', err);
            this.loadingSubscription = false;
          }
        });
    }
  }

  fetchInvoices() {
    this.loadingInvoices = true;
    const url = this.isPlatformAdmin ? `${environment.apiUrl}/billing/admin/invoices` : `${environment.apiUrl}/billing/invoices`;
    
    this.http.get<any>(url)
      .subscribe({
        next: (response) => {
          this.invoices = response.data ? response.data : response;
          this.loadingInvoices = false;
        },
        error: (err) => {
          console.error('Error fetching invoices', err);
          this.loadingInvoices = false;
        }
      });
  }
  
  getPlanNameForInvoice(invoice: Invoice): string {
    if (this.isPlatformAdmin) {
      const client = this.clients.find(c => c.id === invoice.organization_id || c.organization_name === invoice.organization_name);
      return client?.current_subscription?.plan?.plan_name || 'Enterprise Client';
    }
    return this.subscription?.plan?.plan_name || 'Enterprise Client';
  }
  
  isInvoiceTrial(invoice: Invoice): boolean {
    if (invoice.amount_due > 0) return false;
    
    if (this.isPlatformAdmin) {
      const client = this.clients.find(c => c.id === invoice.organization_id || c.organization_name === invoice.organization_name);
      return client?.current_subscription?.status === 'TRIALING';
    }
    return this.subscription?.status === 'TRIALING';
  }
  
  downloadInvoice(invoice: Invoice) {
    if (this.generatingPdf) return;
    
    this.selectedInvoiceForPdf = invoice;
    this.generatingPdf = true;
    
    // Give Angular time to render the hidden template
    setTimeout(() => {
      const element = document.getElementById('pdf-invoice-template');
      if (element) {
        html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4'); // Reverted to portrait A4
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`INV-${invoice.invoice_number}.pdf`);
          
          this.selectedInvoiceForPdf = null;
          this.generatingPdf = false;
        }).catch(err => {
          console.error('Error generating PDF', err);
          this.selectedInvoiceForPdf = null;
          this.generatingPdf = false;
          alert('Failed to generate PDF. Please try again.');
        });
      }
    }, 100);
  }
}
