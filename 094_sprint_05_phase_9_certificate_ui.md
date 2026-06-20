# Sprint 05 – Phase 9: Certificate UI

The Certificate UI feature module has been successfully generated. This concludes the final functional scaffold for Sprint 05. The Certificate module provides the public-facing verification gateways and candidate-facing rendering boundaries, while strictly avoiding any on-the-fly generation math.

## Module Inventory (`src/app/features/certificates/`)

### Pages Scaffolded
*   `CertificateListPageComponent`: Private catalog for Candidates to view their earned credentials.
*   `CertificateDetailPageComponent`: The isolated view wrapper mapped to `/certificates/:uuid`.
*   `CertificateVerificationPageComponent`: The public-facing entry point (`/certificates/verify`) allowing third-party employers to validate a credential.

### Components Scaffolded
*   `CertificateCardComponent` & `CertificateStatusBadgeComponent`: Visual indicators for validity and expiration.
*   `CertificatePreviewComponent`: The rendering surface that will eventually load the PDF or high-res image proxy.
*   `CertificateDownloadPanelComponent`: Controls triggering the Blob file export.
*   `CertificateVerificationFormComponent`: A public input field accepting the UUID.
*   `VerificationResultComponent`: The conditional display returning `Valid` or `Invalid/Expired` status without leaking candidate PII.

### Strategy Implementation
*   **Zero Generation Logic:** The frontend makes absolutely no attempt to combine fonts, overlay text on images, or generate PDFs. It acts purely as a consumer of the `GET /api/v1/certificates` endpoints. 
*   **Verification Security:** The `CertificateVerificationPageComponent` is deliberately decoupled from the AuthGuard layout to ensure public access, relying on the `CertificateFacade.verifyCertificate()` method to hit the unauthenticated `/verify` backend route.
*   **Blob Export:** The `CertificateApiService.downloadCertificate()` specifies `responseType: 'blob'`, guaranteeing that high-resolution certificate files do not crash the Angular JSON parsers upon download.

### Facade & State Management
*   **Signal Stores:** Generated `CertificateStore` for private candidate state, and `VerificationStore` specifically for the public lookup result.
*   **Facade Pattern:** The `CertificateFacade` binds the UI components to the API, intercepting the HTTP Observables and hydrating the `signals` safely.

### Routing Map (`certificates.routes.ts`)
*   `/certificates`
*   `/certificates/:uuid`
*   `/certificates/verify` (Preceding `:uuid` to prevent route shadowing)

## Architectural Compliance
*   **Compliance with Architecture Rules:** All business logic, HTTP clients, and heavy lifting have been stripped from the UI layers. The Standalone components rely entirely on Signal injection.

## Next Steps
This concludes the core module scaffolding for Sprint 05. Awaiting your command to proceed to final Sprint Testing, Completion Reporting, or further execution directives.
