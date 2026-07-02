import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface VerificationResult {
  certificateUuid: string;
  verificationCode: string;
  status: string;
  issuedAt: string;
  candidateName: string;
  assessmentName: string;
}

@Component({
  selector: 'app-certificate-verification-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col items-center p-6 overflow-y-auto">
      
      <div class="text-center mb-12 mt-12">
        <h1 class="text-3xl font-bold text-main">Certificate Verification</h1>
        <p class="text-muted mt-2 max-w-md mx-auto">Verify the authenticity of a Snapflect assessment certificate by entering the unique 12-character verification code.</p>
      </div>

      <div class="glass-card w-full max-w-xl p-8 shadow-xl">
        <form (ngSubmit)="verify()" class="flex flex-col gap-4">
          <label class="text-sm font-semibold text-main">Verification Code</label>
          <div class="flex gap-3">
            <input 
              type="text" 
              name="code"
              [(ngModel)]="code"
              placeholder="e.g. A1B2C3D4E5F6"
              class="flex-1 bg-input-bg border border-border text-main rounded-md px-4 py-3 outline-none focus:border-brand font-mono tracking-widest uppercase transition-colors"
              required>
            <button 
              type="submit" 
              [disabled]="loading || !code"
              class="bg-brand text-white font-semibold px-6 py-3 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]">
              <span *ngIf="!loading">Verify</span>
              <svg *ngIf="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
          </div>
        </form>

        <!-- Error State -->
        <div *ngIf="error" class="mt-8 p-4 rounded-md border border-rose-500/30 bg-rose-500/10 flex items-start gap-3 text-rose-400">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p class="text-sm">The verification code you entered is invalid or the certificate could not be found.</p>
        </div>

        <!-- Success State -->
        <div *ngIf="result" class="mt-8 border-t border-border pt-6 animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-emerald-400">Valid Certificate</h3>
              <p class="text-xs text-muted">This certificate is verified by Snapflect.</p>
            </div>
          </div>

          <div class="bg-input-bg rounded-lg p-5 border border-border">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p class="text-xs text-muted mb-1">Candidate Name</p>
                <p class="font-medium text-main">{{ result.candidateName }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Assessment Name</p>
                <p class="font-medium text-main">{{ result.assessmentName }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Issued Date</p>
                <p class="font-medium text-main">{{ result.issuedAt | date:'mediumDate' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Status</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  {{ result.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CertificateVerificationPageComponent {
  private http = inject(HttpClient);
  
  code = '';
  loading = false;
  error = false;
  result: VerificationResult | null = null;

  verify() {
    if (!this.code) return;
    
    this.loading = true;
    this.error = false;
    this.result = null;

    this.http.get<{data: VerificationResult}>(`${environment.apiUrl}/certificates/verify/${this.code}`)
      .subscribe({
        next: (res) => {
          this.result = res.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Verification failed', err);
          this.error = true;
          this.loading = false;
        }
      });
  }
}