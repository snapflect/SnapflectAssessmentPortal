const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect-frontend', 'src', 'app');

const dirs = [
    'features/certificates/pages/list',
    'features/certificates/pages/detail',
    'features/certificates/pages/verification',
    'features/certificates/components/certificate-card',
    'features/certificates/components/certificate-preview',
    'features/certificates/components/certificate-download-panel',
    'features/certificates/components/certificate-verification-form',
    'features/certificates/components/certificate-status-badge',
    'features/certificates/components/verification-result',
    'features/certificates/facades',
    'core/api',
    'shared/stores'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const writeTsFile = (relativePath, content) => {
    fs.writeFileSync(path.join(baseDir, relativePath), content.trim());
};

// --- STORES ---
writeTsFile('shared/stores/certificate.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class CertificateStore {\n" +
"  private readonly _certificates = signal<any[]>([]);\n" +
"  private readonly _currentCertificate = signal<any | null>(null);\n" +
"  public readonly certificates = this._certificates.asReadonly();\n" +
"  public readonly currentCertificate = this._currentCertificate.asReadonly();\n" +
"  public setCertificates(data: any[]): void { this._certificates.set(data); }\n" +
"  public setCurrentCertificate(data: any): void { this._currentCertificate.set(data); }\n" +
"}\n"
);

writeTsFile('shared/stores/verification.store.ts', 
"import { Injectable, signal } from '@angular/core';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class VerificationStore {\n" +
"  private readonly _verificationResult = signal<any | null>(null);\n" +
"  public readonly verificationResult = this._verificationResult.asReadonly();\n" +
"  public setVerificationResult(data: any): void { this._verificationResult.set(data); }\n" +
"}\n"
);

// --- API SERVICES ---
writeTsFile('core/api/certificate-api.service.ts', 
"import { Injectable } from '@angular/core';\n" +
"import { BaseApiService } from './base-api.service';\n" +
"import { Observable } from 'rxjs';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class CertificateApiService extends BaseApiService {\n" +
"  public getCertificates(): Observable<any> { return this.http.get(this.baseUrl + '/certificates'); }\n" +
"  public getCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid); }\n" +
"  public downloadCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid + '/download', { responseType: 'blob' }); }\n" +
"  public verifyCertificate(uuid: string): Observable<any> { return this.http.get(this.baseUrl + '/certificates/' + uuid + '/verify'); }\n" +
"}\n"
);

// --- FACADES ---
writeTsFile('features/certificates/facades/certificate.facade.ts', 
"import { Injectable, inject } from '@angular/core';\n" +
"import { CertificateApiService } from '../../../core/api/certificate-api.service';\n" +
"import { CertificateStore } from '../../../shared/stores/certificate.store';\n" +
"import { VerificationStore } from '../../../shared/stores/verification.store';\n" +
"import { tap } from 'rxjs/operators';\n" +
"@Injectable({ providedIn: 'root' })\n" +
"export class CertificateFacade {\n" +
"  private api = inject(CertificateApiService);\n" +
"  private store = inject(CertificateStore);\n" +
"  private vStore = inject(VerificationStore);\n" +
"  public loadCertificates() { return this.api.getCertificates().pipe(tap(res => this.store.setCertificates(res.data))); }\n" +
"  public loadCertificate(uuid: string) { return this.api.getCertificate(uuid).pipe(tap(res => this.store.setCurrentCertificate(res.data))); }\n" +
"  public downloadCertificate(uuid: string) { return this.api.downloadCertificate(uuid); }\n" +
"  public verifyCertificate(uuid: string) { return this.api.verifyCertificate(uuid).pipe(tap(res => this.vStore.setVerificationResult(res.data))); }\n" +
"}\n"
);

// --- COMPONENTS ---
const components = [
  'certificate-card',
  'certificate-preview',
  'certificate-download-panel',
  'certificate-verification-form',
  'certificate-status-badge',
  'verification-result'
];
components.forEach(c => {
    const className = c.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
    writeTsFile('features/certificates/components/' + c + '/' + c + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + c + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- PAGES ---
const pages = [
  { dir: 'list', file: 'certificate-list-page' },
  { dir: 'detail', file: 'certificate-detail-page' },
  { dir: 'verification', file: 'certificate-verification-page' }
];
pages.forEach(p => {
    const className = p.file.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
    writeTsFile('features/certificates/pages/' + p.dir + '/' + p.file + '.component.ts', 
"import { Component } from '@angular/core';\n" +
"import { CommonModule } from '@angular/common';\n" +
"@Component({\n" +
"  selector: 'app-" + p.file + "',\n" +
"  standalone: true,\n" +
"  imports: [CommonModule],\n" +
"  template: '<div>" + className + " Scaffolded</div>'\n" +
"})\n" +
"export class " + className + " {}\n"
    );
});

// --- ROUTING ---
writeTsFile('features/certificates/certificates.routes.ts', 
"import { Routes } from '@angular/router';\n" +
"import { CertificateListPageComponent } from './pages/list/certificate-list-page.component';\n" +
"import { CertificateDetailPageComponent } from './pages/detail/certificate-detail-page.component';\n" +
"import { CertificateVerificationPageComponent } from './pages/verification/certificate-verification-page.component';\n" +
"\n" +
"export const CERTIFICATES_ROUTES: Routes = [\n" +
"  { path: 'verify', component: CertificateVerificationPageComponent },\n" + // verify first so it doesn't match :uuid
"  { path: ':uuid', component: CertificateDetailPageComponent },\n" +
"  { path: '', component: CertificateListPageComponent }\n" +
"];\n"
);

console.log('Sprint 05 Phase 9 Certificate UI generated successfully.');
