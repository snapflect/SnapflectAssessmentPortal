import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Certificate {
  uuid: string;
  attributes: {
    certificate_number: string;
    issue_date: string;
    expiry_date?: string;
    score: number;
    status: string;
    verification_code: string;
  };
  relationships?: {
    result?: {
      relationships?: {
        assessment?: { attributes: { title: string } };
      };
    };
    candidate?: { attributes: { first_name: string; last_name: string } };
  };
}

@Component({
  selector: 'app-certificate-list-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col relative overflow-y-auto custom-scrollbar">
      <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-main tracking-tight">My Certificates</h2>
        <p class="text-muted text-sm mt-1">Your earned certificates from completed assessments.</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-darker"></div>
          <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
        </div>
        <p class="mt-4 text-muted font-medium animate-pulse">Loading your certificates...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && certificates.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600 bg-surface/30 rounded-3xl border border-border-light border-dashed">
        <div class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-main mb-2">No certificates yet</h3>
        <p class="text-sm text-muted text-center max-w-sm">Complete and pass an assessment to earn your first certificate.</p>
      </div>

      <!-- Certificate Cards Grid -->
      <div *ngIf="!loading && certificates.length > 0" class="pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div *ngFor="let cert of certificates" class="relative group">

            <!-- Certificate Card - Styled like a real certificate -->
            <div class="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">

              <!-- Decorative top border -->
              <div class="h-2 w-full bg-gradient-to-r from-brand via-brand-light to-indigo-400"></div>

              <!-- Header -->
              <div class="p-6 pb-4">
                <div class="flex items-start justify-between mb-4">
                  <!-- Certificate Badge Icon -->
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-brand-light/20 border border-brand/30 flex items-center justify-center">
                    <svg class="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                  </div>

                  <!-- Status -->
                  <span class="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        [ngClass]="cert.attributes.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                    {{ cert.attributes.status }}
                  </span>
                </div>

                <!-- Certificate Title -->
                <h3 class="text-main font-bold text-base leading-snug mb-1">
                  Certificate of Achievement
                </h3>
                <p class="text-brand-light text-sm font-medium">
                  {{ cert.relationships?.result?.relationships?.assessment?.attributes?.title || 'Assessment Completed' }}
                </p>

                <!-- Candidate Name -->
                <p class="text-slate-500 text-xs mt-2">
                  Awarded to: <span class="text-muted">
                    {{ cert.relationships?.candidate?.attributes?.first_name }}
                    {{ cert.relationships?.candidate?.attributes?.last_name }}
                  </span>
                </p>
              </div>

              <!-- Certificate Details -->
              <div class="px-6 pb-4 grid grid-cols-3 gap-3">
                <div class="text-center p-2 hover:brightness-110 rounded-lg">
                  <div class="text-lg font-bold text-emerald-400">{{ cert.attributes.score }}%</div>
                  <div class="text-xs text-slate-600 mt-0.5">Score</div>
                </div>
                <div class="text-center p-2 hover:brightness-110 rounded-lg">
                  <div class="text-xs font-bold text-main">{{ cert.attributes.issue_date | date:'MMM d' }}</div>
                  <div class="text-xs text-slate-600 mt-0.5">{{ cert.attributes.issue_date | date:'yyyy' }}</div>
                  <div class="text-[10px] text-slate-600">Issued</div>
                </div>
                <div class="text-center p-2 hover:brightness-110 rounded-lg">
                  <div class="text-xs font-bold" [ngClass]="cert.attributes.expiry_date ? 'text-amber-400' : 'text-muted'">
                    {{ cert.attributes.expiry_date ? (cert.attributes.expiry_date | date:'MMM y') : 'No' }}
                  </div>
                  <div class="text-[10px] text-slate-600 mt-0.5">Expiry</div>
                </div>
              </div>

              <!-- Verification Code -->
              <div class="px-6 py-3 border-t border-white/5 bg-input-bg">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Verification Code</div>
                    <div class="font-mono text-xs text-muted">{{ cert.attributes.verification_code }}</div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="downloadCertificate(cert)" class="text-xs px-3 py-1.5 bg-brand/10 text-brand-light border border-brand/20 rounded-lg hover:bg-brand/20 transition-colors flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download
                    </button>
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
export class CertificateListPageComponent implements OnInit {
  certificates: Certificate[] = [];
  loading = true;
  private http = inject(HttpClient);

  ngOnInit() { this.fetchCertificates(); }

  fetchCertificates() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/certificates?per_page=50`)
      .subscribe({
        next: (res) => {
          const results = res.data || res;
          this.certificates = results.map((r: any) => ({
            uuid: r.certificateUuid,
            attributes: {
              certificate_number: `CERT-${r.certificateUuid?.slice(0, 8).toUpperCase()}`,
              issue_date: r.issuedAt,
              expiry_date: null,
              score: 100, // Placeholder since score isn't on the resource by default
              status: r.status,
              verification_code: r.verificationCode
            },
            relationships: {
              result: {
                relationships: {
                  assessment: { attributes: { title: r.assessmentName } }
                }
              },
              candidate: { attributes: { first_name: r.candidateName, last_name: '' } }
            }
          }));
          this.loading = false;
        },
        error: (err) => { console.error(err); this.loading = false; }
      });
  }

  downloadCertificate(cert: Certificate) {
    // In production this would call a PDF generation endpoint
    window.open(`${environment.apiUrl}/certificates/${cert.uuid}/download`, '_blank');
  }
}