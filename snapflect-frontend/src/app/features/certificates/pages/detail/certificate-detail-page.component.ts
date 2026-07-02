import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface CertificateDetail {
  certificateUuid: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  candidateName: string;
  assessmentName: string;
  downloadUrl: string | null;
}

@Component({
  selector: 'app-certificate-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
      
      <div *ngIf="loading" class="text-muted">
        Loading certificate...
      </div>

      <div *ngIf="!loading && !certificate" class="text-center text-muted">
        <svg class="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p class="text-lg">Certificate not found.</p>
        <a routerLink="/certificates" class="mt-4 inline-block text-brand hover:underline">← Back to My Certificates</a>
      </div>

      <div *ngIf="!loading && certificate" class="w-full max-w-4xl relative">
        <a routerLink="/certificates" class="absolute -top-12 left-0 text-brand-light hover:underline text-sm">← Back to My Certificates</a>
        
        <!-- The Certificate Card -->
        <div class="bg-white rounded-lg shadow-2xl overflow-hidden relative border-8 border-double border-slate-200">
          
          <!-- Background decoration -->
          <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand via-slate-100 to-white"></div>
          <svg class="absolute top-0 right-0 w-64 h-64 text-brand/5 pointer-events-none -mt-10 -mr-10" fill="currentColor" viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>

          <div class="p-16 relative z-10 flex flex-col items-center text-center">
            
            <div class="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center shadow-lg mb-8">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            </div>

            <h1 class="text-4xl font-serif text-slate-800 tracking-wider uppercase mb-2">Certificate of Completion</h1>
            <p class="text-slate-500 font-medium mb-10">This is to certify that</p>
            
            <h2 class="text-5xl font-serif text-brand mb-10 italic">{{ certificate.candidateName }}</h2>
            
            <p class="text-slate-500 font-medium mb-4">has successfully completed the assessment for</p>
            <h3 class="text-2xl font-bold text-slate-800 mb-12">{{ certificate.assessmentName }}</h3>

            <div class="w-full flex justify-between items-end border-t-2 border-slate-200 pt-8 mt-8">
              <div class="text-left">
                <p class="text-sm font-bold text-slate-800">{{ certificate.issuedAt | date:'longDate' }}</p>
                <p class="text-xs text-slate-500 uppercase tracking-widest mt-1">Date Issued</p>
              </div>
              
              <div class="text-center">
                <div class="w-32 h-12 flex items-center justify-center font-signature text-2xl text-slate-700 mx-auto border-b border-slate-300">
                  Snapflect Admin
                </div>
                <p class="text-xs text-slate-500 uppercase tracking-widest mt-2">Authorized Signature</p>
              </div>
            </div>

          </div>
        </div>
        
        <!-- Actions & Info footer -->
        <div class="mt-8 flex flex-col md:flex-row justify-between items-center bg-glass border border-border p-4 rounded-lg shadow-lg">
          <div>
            <p class="text-sm text-muted">Verification Code: <span class="text-main font-mono tracking-wider ml-2 bg-slate-800 px-2 py-1 rounded">{{ certificate.verificationCode }}</span></p>
            <p class="text-xs text-muted mt-1">Status: <span [class]="certificate.status === 'VALID' ? 'text-emerald-400' : 'text-rose-400'">{{ certificate.status }}</span></p>
          </div>
          <div class="flex gap-3 mt-4 md:mt-0">
            <button class="px-4 py-2 border border-border bg-input-bg text-main text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors">
              Copy Link
            </button>
            <button class="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-md hover:bg-brand-dark transition-colors flex items-center gap-2"
                    [disabled]="!certificate.downloadUrl"
                    [class.opacity-50]="!certificate.downloadUrl">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap');
    
    .font-serif {
      font-family: 'Playfair Display', serif;
    }
    .font-signature {
      font-family: 'Great Vibes', cursive;
    }
  `]
})
export class CertificateDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  certificate: CertificateDetail | null = null;
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.fetchCertificate(uuid);
      } else {
        this.loading = false;
      }
    });
  }

  fetchCertificate(uuid: string) {
    this.http.get<{data: CertificateDetail}>(`${environment.apiUrl}/certificates/${uuid}`)
      .subscribe({
        next: (res) => {
          this.certificate = res.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching certificate', err);
          this.loading = false;
        }
      });
  }
}