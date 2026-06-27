import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CertificateFacade } from '../../facades/certificate.facade';

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-12">
      
      @if (store.isLoading()) {
        <div class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (store.error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-md shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-bold text-red-800">{{ store.error().title || 'Verification Failed' }}</h3>
              <p class="mt-2 text-red-700">{{ store.error().detail || 'The certificate could not be verified.' }}</p>
            </div>
          </div>
        </div>
      }

      @if (!store.isLoading() && store.certificate()) {
        
        <!-- Status Banner -->
        <div class="mb-8 rounded-lg p-6 shadow-sm border"
             [ngClass]="store.isValid() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              @if (store.isValid()) {
                <svg class="h-10 w-10 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 class="text-2xl font-bold text-green-800">Valid Certificate</h2>
                  <p class="text-green-700">This credential is active and verified by Snapflect.</p>
                </div>
              } @else {
                <svg class="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 class="text-2xl font-bold text-red-800">Revoked Certificate</h2>
                  <p class="text-red-700">This credential has been formally revoked and is no longer valid.</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Certificate Details Widget -->
        <div class="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-8 py-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Credential Details</h3>
          </div>
          <div class="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <dt class="text-sm font-medium text-gray-500">Candidate Name</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900">{{ store.certificate()?.candidateName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Assessment</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900">{{ store.certificate()?.assessmentName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Date Issued</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900">{{ store.certificate()?.issuedAt | date:'longDate' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Verification Code</dt>
              <dd class="mt-1 text-lg font-mono font-bold tracking-widest text-indigo-600">{{ store.certificate()?.verificationCode }}</dd>
            </div>
          </div>
          
          <!-- Download Button -->
          <div class="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end">
            <a [href]="store.certificate()?.downloadUrl" 
               target="_blank"
               class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
               [class.opacity-50]="store.isRevoked()"
               [class.cursor-not-allowed]="store.isRevoked()"
               [attr.disabled]="store.isRevoked() ? true : null">
              <svg class="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class CertificateViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private facade = inject(CertificateFacade);
  public store = this.facade.store;

  ngOnInit(): void {
    // Determine if we are loading via UUID (Candidate Portal) or Code (Public Verification Portal)
    const verificationCode = this.route.snapshot.queryParamMap.get('code');
    const certificateUuid = this.route.snapshot.paramMap.get('certificateUuid');

    if (verificationCode) {
      this.facade.verifyCertificate(verificationCode);
    } else if (certificateUuid) {
      this.facade.loadCertificate(certificateUuid);
    }
  }
}
