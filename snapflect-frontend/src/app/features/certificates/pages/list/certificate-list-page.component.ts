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
    <div class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">My Certificates</h2>
          <p class="text-slate-400 text-sm mt-1">Your earned certificates from completed assessments.</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex-1 flex items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-brand-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && certificates.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600">
        <svg class="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
        <p class="text-xl">No certificates yet.</p>
        <p class="text-sm mt-2">Complete and pass an assessment to earn your first certificate.</p>
      </div>

      <!-- Certificate Cards Grid -->
      <div *ngIf="!loading" class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div *ngFor="let cert of certificates" class="relative group">

            <!-- Certificate Card - Styled like a real certificate -->
            <div class="glass-card overflow-hidden border border-white/10 group-hover:border-brand/30 transition-all">

              <!-- Decorative top border -->
              <div class="h-1.5 bg-gradient-to-r from-brand via-brand-light to-indigo-400"></div>

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
                <h3 class="text-white font-bold text-base leading-snug mb-1">
                  Certificate of Achievement
                </h3>
                <p class="text-brand-light text-sm font-medium">
                  {{ cert.relationships?.result?.relationships?.assessment?.attributes?.title || 'Assessment Completed' }}
                </p>

                <!-- Candidate Name -->
                <p class="text-slate-500 text-xs mt-2">
                  Awarded to: <span class="text-slate-300">
                    {{ cert.relationships?.candidate?.attributes?.first_name }}
                    {{ cert.relationships?.candidate?.attributes?.last_name }}
                  </span>
                </p>
              </div>

              <!-- Certificate Details -->
              <div class="px-6 pb-4 grid grid-cols-3 gap-3">
                <div class="text-center p-2 bg-white/5 rounded-lg">
                  <div class="text-lg font-bold text-emerald-400">{{ cert.attributes.score }}%</div>
                  <div class="text-xs text-slate-600 mt-0.5">Score</div>
                </div>
                <div class="text-center p-2 bg-white/5 rounded-lg">
                  <div class="text-xs font-bold text-white">{{ cert.attributes.issue_date | date:'MMM d' }}</div>
                  <div class="text-xs text-slate-600 mt-0.5">{{ cert.attributes.issue_date | date:'yyyy' }}</div>
                  <div class="text-[10px] text-slate-600">Issued</div>
                </div>
                <div class="text-center p-2 bg-white/5 rounded-lg">
                  <div class="text-xs font-bold" [ngClass]="cert.attributes.expiry_date ? 'text-amber-400' : 'text-slate-400'">
                    {{ cert.attributes.expiry_date ? (cert.attributes.expiry_date | date:'MMM y') : 'No' }}
                  </div>
                  <div class="text-[10px] text-slate-600 mt-0.5">Expiry</div>
                </div>
              </div>

              <!-- Verification Code -->
              <div class="px-6 py-3 border-t border-white/5 bg-black/20">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Verification Code</div>
                    <div class="font-mono text-xs text-slate-400">{{ cert.attributes.verification_code }}</div>
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
    this.http.get<any>(`${environment.apiUrl}/results/?include=candidate,assessment&per_page=50`)
      .subscribe({
        next: (res) => {
          // Simulate certificates from results data until a dedicated /certificates endpoint exists
          const results = res.data || res;
          this.certificates = results
            .filter((r: any) => r.attributes?.is_passed)
            .map((r: any) => ({
              uuid: r.uuid,
              attributes: {
                certificate_number: `CERT-${r.uuid?.slice(0, 8).toUpperCase()}`,
                issue_date: r.attributes?.scored_at || new Date().toISOString(),
                expiry_date: null,
                score: r.attributes?.percentage_score || 0,
                status: 'ACTIVE',
                verification_code: r.uuid?.replace(/-/g, '').slice(0, 12).toUpperCase() || 'N/A'
              },
              relationships: {
                result: r,
                candidate: r.relationships?.candidate
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