import { Routes } from '@angular/router';
import { CertificateListPageComponent } from './pages/list/certificate-list-page.component';
import { CertificateDetailPageComponent } from './pages/detail/certificate-detail-page.component';
import { CertificateVerificationPageComponent } from './pages/verification/certificate-verification-page.component';

export const CERTIFICATES_ROUTES: Routes = [
  { path: 'verify', component: CertificateVerificationPageComponent },
  { path: ':uuid', component: CertificateDetailPageComponent },
  { path: '', component: CertificateListPageComponent }
];