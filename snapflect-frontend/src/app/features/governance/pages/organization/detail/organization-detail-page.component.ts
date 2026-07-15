import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-surface p-6">

      <!-- Back + Header -->
      <div class="max-w-5xl mx-auto">
        <div class="mb-6">
          <button (click)="goBack()" class="flex items-center gap-2 text-muted hover:text-main transition-colors text-sm mb-4 group">
            <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Organizations
          </button>

          <!-- Loading skeleton -->
          <div *ngIf="loading" class="animate-pulse space-y-3">
            <div class="h-8 bg-white/10 rounded w-1/3"></div>
            <div class="h-4 bg-white/5 rounded w-1/4"></div>
          </div>

          <!-- Page title -->
          <div *ngIf="!loading && org" class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl font-bold text-main tracking-tight">{{ org.attributes.organization_name }}</h1>
                <span class="font-mono text-xs px-2 py-1 rounded-md bg-white/10 text-muted">{{ org.attributes.organization_code }}</span>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                      [ngClass]="{
                        'bg-green-500/15 text-green-400': org.attributes.status === 'ACTIVE',
                        'bg-yellow-500/15 text-yellow-400': org.attributes.status === 'PENDING',
                        'bg-red-500/15 text-red-400': org.attributes.status === 'SUSPENDED'
                      }">
                  {{ org.attributes.status }}
                </span>
              </div>
              <p class="text-muted text-sm mt-1">UUID: <span class="font-mono text-xs">{{ org.uuid }}</span></p>
            </div>
            <div class="flex items-center gap-2">
              <a [routerLink]="['/governance/organizations', org.uuid, 'edit']"
                 class="btn-secondary text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.172-8.172z"/>
                </svg>
                Edit
              </a>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div *ngIf="!loading && !org" class="card p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-main mb-1">Organization Not Found</h3>
          <p class="text-muted text-sm mb-4">The organization you are looking for does not exist or you don't have access.</p>
          <button (click)="goBack()" class="btn-primary px-4 py-2 rounded-lg text-sm">Go Back</button>
        </div>

        <!-- Main content grid -->
        <div *ngIf="!loading && org" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- LEFT COLUMN: Details + Actions -->
          <div class="lg:col-span-2 space-y-6">

            <!-- ─── Organization Info Card ─── -->
            <div class="card p-6">
              <h2 class="text-base font-semibold text-main mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Organization Details
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Legal Name</p>
                  <p class="text-sm text-main font-medium">{{ org.attributes.legal_name || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Contact Email</p>
                  <p class="text-sm text-main font-medium">{{ org.attributes.contact_email || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Country</p>
                  <p class="text-sm text-main font-medium">{{ org.attributes.country || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Timezone</p>
                  <p class="text-sm text-main font-medium">{{ org.attributes.timezone || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Created</p>
                  <p class="text-sm text-main font-medium">{{ org.timestamps?.created_date | date:'mediumDate' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-muted uppercase tracking-wider">Last Updated</p>
                  <p class="text-sm text-main font-medium">{{ org.timestamps?.modified_date | date:'mediumDate' }}</p>
                </div>
              </div>
            </div>

            <!-- ─── Invite Client Admin Card ─── -->
            <div class="card p-6 border border-brand/20 relative overflow-hidden">
              <!-- Glow accent -->
              <div class="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none"></div>
              <div class="relative">
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h2 class="text-base font-semibold text-main flex items-center gap-2">
                      <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Invite Client Admin
                    </h2>
                    <p class="text-sm text-muted mt-1">
                      Send a secure claim-account email to
                      <span class="text-brand-light font-medium">{{ org.attributes.contact_email }}</span>.
                      The admin will receive a one-time link to set their password and complete onboarding.
                    </p>
                  </div>
                  <div class="flex-shrink-0">
                    <div *ngIf="inviteStatus === 'sent'" class="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Invite Sent!
                    </div>
                  </div>
                </div>

                <!-- Onboarding steps hint -->
                <div class="mt-4 mb-5 bg-white/5 rounded-lg p-4 border border-white/10">
                  <p class="text-xs text-muted font-medium uppercase tracking-wider mb-3">What happens next</p>
                  <ol class="space-y-2">
                    <li class="flex items-start gap-2 text-xs text-muted">
                      <span class="w-4 h-4 rounded-full bg-brand/20 text-brand flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                      Admin receives email with a secure claim link
                    </li>
                    <li class="flex items-start gap-2 text-xs text-muted">
                      <span class="w-4 h-4 rounded-full bg-brand/20 text-brand flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                      Admin sets their password via the claim-account page
                    </li>
                    <li class="flex items-start gap-2 text-xs text-muted">
                      <span class="w-4 h-4 rounded-full bg-brand/20 text-brand flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                      Admin completes the 4-step onboarding wizard (Legal → Branding → SSO → Data Import)
                    </li>
                    <li class="flex items-start gap-2 text-xs text-muted">
                      <span class="w-4 h-4 rounded-full bg-brand/20 text-brand flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">4</span>
                      Admin lands on their tenant dashboard, ready to create assessments
                    </li>
                  </ol>
                </div>

                <button (click)="sendInvite()"
                        [disabled]="sendingInvite || inviteStatus === 'sent'"
                        class="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  <svg *ngIf="!sendingInvite" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  <svg *ngIf="sendingInvite" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ sendingInvite ? 'Sending Invite...' : inviteStatus === 'sent' ? 'Invite Sent ✓' : 'Send Admin Invite Email' }}
                </button>
              </div>
            </div>

            <!-- ─── SMTP Configuration Card ─── -->
            <div class="card p-6">
              <div class="flex items-center justify-between mb-4 cursor-pointer" (click)="smtpExpanded = !smtpExpanded">
                <h2 class="text-base font-semibold text-main flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Tenant SMTP Configuration
                  <span class="text-xs text-muted font-normal ml-1">(Optional)</span>
                </h2>
                <svg class="w-4 h-4 text-muted transition-transform" [class.rotate-180]="smtpExpanded" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              <div *ngIf="smtpExpanded">
                <p class="text-sm text-muted mb-5">Override the platform's default email server with tenant-specific SMTP settings. This allows the client's emails to come from their own domain.</p>
                <form [formGroup]="smtpForm" (ngSubmit)="saveSmtp()" class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">SMTP Host *</label>
                      <input type="text" formControlName="smtp_host" placeholder="smtp.example.com"
                             class="input-field w-full text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">SMTP Port *</label>
                      <input type="number" formControlName="smtp_port" placeholder="587"
                             class="input-field w-full text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">Username *</label>
                      <input type="text" formControlName="smtp_username" placeholder="noreply@example.com"
                             class="input-field w-full text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">Password *</label>
                      <input type="password" formControlName="smtp_password" placeholder="••••••••"
                             class="input-field w-full text-sm">
                    </div>
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">Encryption</label>
                      <select formControlName="smtp_encryption" class="input-field w-full text-sm">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="">None</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-muted mb-1.5 font-medium">From Address *</label>
                      <input type="email" formControlName="smtp_from_address" placeholder="noreply@example.com"
                             class="input-field w-full text-sm">
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-xs text-muted mb-1.5 font-medium">From Name *</label>
                      <input type="text" formControlName="smtp_from_name" placeholder="Example Corp"
                             class="input-field w-full text-sm">
                    </div>
                  </div>
                  <div class="flex justify-end pt-2">
                    <button type="submit" [disabled]="savingSmtp || smtpForm.invalid"
                            class="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                      <svg *ngIf="savingSmtp" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {{ savingSmtp ? 'Saving...' : 'Save SMTP Settings' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Subscription + Invoice -->
          <div class="space-y-6">

            <!-- ─── Subscription Card ─── -->
            <div class="card p-5">
              <h2 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                Subscription
              </h2>

              <div *ngIf="loadingBilling" class="animate-pulse space-y-2">
                <div class="h-5 bg-white/10 rounded w-2/3"></div>
                <div class="h-4 bg-white/5 rounded w-1/2"></div>
                <div class="h-4 bg-white/5 rounded w-3/4"></div>
              </div>

              <div *ngIf="!loadingBilling && billing?.subscription" class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-brand-light">{{ billing.subscription.plan?.plan_name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [ngClass]="{
                          'bg-green-500/15 text-green-400': billing.subscription.status === 'ACTIVE',
                          'bg-blue-500/15 text-blue-400': billing.subscription.status === 'TRIALING',
                          'bg-red-500/15 text-red-400': billing.subscription.status === 'PAST_DUE',
                          'bg-gray-500/15 text-gray-400': billing.subscription.status === 'EXPIRED'
                        }">
                    {{ billing.subscription.status }}
                  </span>
                </div>
                <div class="text-xs text-muted space-y-1.5 border-t border-white/10 pt-3">
                  <div class="flex justify-between">
                    <span>Start Date</span>
                    <span class="text-main">{{ billing.subscription.start_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>End Date</span>
                    <span class="text-main">{{ billing.subscription.end_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Assessments Used</span>
                    <span class="text-main">
                      {{ billing.subscription.assessments_used }}
                      / {{ billing.subscription.plan?.max_assessments || '∞' }}
                    </span>
                  </div>
                </div>
              </div>

              <div *ngIf="!loadingBilling && !billing?.subscription" class="text-center py-4">
                <p class="text-muted text-xs italic">No active subscription found.</p>
              </div>
            </div>

            <!-- ─── Tenant DB Card ─── -->
            <div class="card p-5">
              <h2 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4-8 4s8 1.79 8 4"/>
                </svg>
                Tenant Infrastructure
              </h2>
              <div class="space-y-2 text-xs text-muted">
                <div class="flex items-center justify-between">
                  <span>Tenant ID</span>
                  <span class="font-mono text-main">{{ org.attributes.organization_code | lowercase }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Database</span>
                  <span class="flex items-center gap-1.5 text-green-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                    Provisioned
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Subdomain</span>
                  <span class="font-mono text-main text-[11px]">{{ org.attributes.organization_code | lowercase }}.snapflect.localhost</span>
                </div>
              </div>
            </div>

            <!-- ─── Invoice History Card ─── -->
            <div class="card p-5">
              <h2 class="text-sm font-semibold text-main mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                </svg>
                Invoices
              </h2>

              <div *ngIf="loadingBilling" class="space-y-2 animate-pulse">
                <div class="h-4 bg-white/10 rounded"></div>
                <div class="h-4 bg-white/5 rounded"></div>
              </div>

              <div *ngIf="!loadingBilling && billing?.invoices?.length === 0" class="text-center py-3">
                <p class="text-muted text-xs italic">No invoices yet.</p>
              </div>

              <div *ngIf="!loadingBilling && billing?.invoices?.length > 0" class="space-y-2">
                <div *ngFor="let inv of billing.invoices"
                     class="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-xs">
                  <div>
                    <p class="text-main font-medium">{{ inv.invoice_number }}</p>
                    <p class="text-muted mt-0.5">{{ inv.created_date | date:'shortDate' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-main font-medium">₹{{ inv.amount_due | number }}</p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          [ngClass]="{
                            'bg-green-500/15 text-green-400': inv.status === 'PAID',
                            'bg-yellow-500/15 text-yellow-400': inv.status === 'PENDING',
                            'bg-red-500/15 text-red-400': inv.status === 'OVERDUE'
                          }">
                      {{ inv.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class OrganizationDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  private fb = inject(FormBuilder);

  org: any = null;
  billing: any = null;
  loading = true;
  loadingBilling = true;
  sendingInvite = false;
  savingSmtp = false;
  smtpExpanded = false;
  inviteStatus: 'idle' | 'sent' = 'idle';

  smtpForm!: FormGroup;

  ngOnInit(): void {
    this.smtpForm = this.fb.group({
      smtp_host:         ['', Validators.required],
      smtp_port:         [587, Validators.required],
      smtp_username:     ['', Validators.required],
      smtp_password:     ['', Validators.required],
      smtp_encryption:   ['tls'],
      smtp_from_address: ['', [Validators.required, Validators.email]],
      smtp_from_name:    ['', Validators.required],
    });

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadOrg(uuid);
    }
  }

  private loadOrg(uuid: string): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/governance/organizations/${uuid}`)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => {
          this.org = res.data;
          this.loadBilling(uuid);
        },
        error: () => {
          this.toast.error('Error', 'Failed to load organization details.');
        }
      });
  }

  private loadBilling(uuid: string): void {
    this.loadingBilling = true;
    this.http.get<any>(`${environment.apiUrl}/governance/organizations/${uuid}/billing`)
      .pipe(finalize(() => this.loadingBilling = false))
      .subscribe({
        next: res => { this.billing = res.data; },
        error: () => { this.billing = null; }
      });
  }

  sendInvite(): void {
    if (!this.org) return;
    this.sendingInvite = true;
    this.http.post<any>(`${environment.apiUrl}/governance/organizations/${this.org.uuid}/invite-admin`, {})
      .pipe(finalize(() => this.sendingInvite = false))
      .subscribe({
        next: () => {
          this.inviteStatus = 'sent';
          this.toast.success(
            'Invite Sent',
            `A claim-account email has been dispatched to ${this.org.attributes.contact_email}.`
          );
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Failed to send invite. Check SMTP configuration.';
          this.toast.error('Invite Failed', msg);
        }
      });
  }

  saveSmtp(): void {
    if (this.smtpForm.invalid || !this.org) return;
    this.savingSmtp = true;
    this.http.post<any>(`${environment.apiUrl}/governance/organizations/${this.org.uuid}/smtp`, this.smtpForm.value)
      .pipe(finalize(() => this.savingSmtp = false))
      .subscribe({
        next: () => {
          this.toast.success('SMTP Updated', 'Tenant email settings saved successfully.');
          this.smtpExpanded = false;
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Failed to save SMTP settings.';
          this.toast.error('Error', msg);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/governance/organizations']);
  }
}