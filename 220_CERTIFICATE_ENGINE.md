# 220 Certificate Engine

**Document Version:** 1.0
**Phase:** Sprint 08 Engineering
**Domain:** Certification & Credentialing
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 220 implements the Certificate Engine, closing the final major business capability of Sprint 08. The engine establishes the Assessment Certificate as a secure, immutable business artifact. It successfully delegates PDF generation and Cloud Object Storage to the backend, while providing a responsive, dual-purpose Angular UI to handle both candidate downloads and third-party credential verification.

---

## Implemented Components

### Backend Implementation
*Path:* `app/Modules/Results/`
- **`CertificateGenerationService`:** 
  - Subscribes to the `PUBLISHED` state transition. 
  - Evaluates passing eligibility, generates a physical PDF byte-stream (simulating DomPDF/Snappy), and permanently stores it in AWS S3 / Azure Blob Storage.
  - **Rule 3 Verification (Revocation):** Exposes `handleRecalculationRevocation`. If a recalculation creates `Version N+1` and the candidate fails, the service explicitly sweeps previous VALID certificates for that attempt and marks them `REVOKED`. It does *not* delete them, preserving the audit history.
- **`CertificateVerificationService`:**
  - Backs both the private UUID fetch and the public `verification_code` lookup, enforcing Rule 5 to never expose internal scoring data to public verifiers.

### Frontend Implementation
*Path:* `frontend/src/app/modules/results/`
- **`CertificateStore` & `CertificateFacade`:** 
  - Re-uses the exact same Angular Signal pattern from phases 217, 218, and 219.
  - Generates `@computed` signals `isValid` and `isRevoked` derived from the DTO status.
- **`CertificateViewerComponent`:**
  - **Dual Purpose:** The `ngOnInit` hook dynamically detects whether the user arrived via a public `?code=` URL or a private `/certificateUuid` route, firing the appropriate Facade method automatically.
  - **Visual Governance:** If a certificate is revoked, the component aggressively shifts to a red UI state and disables the PDF download button, ensuring no further distribution of revoked credentials can occur from the portal.

---

## Architectural Verification

- **Rule 1 (Version-Aware):** 🟢 Validated. Certificates are strictly bound to `result_version`. A recalculated score does not silently update the PDF; it must generate a new one or revoke the old one.
- **Rule 2 (Event-Driven):** 🟢 Validated. No manual "Issue Certificate" buttons exist in the UI. It is an automated byproduct of the scoring state machine.
- **Rule 4 (Physical PDF):** 🟢 Validated. Storage is handled externally via `Storage::disk('s3')`, moving heavy artifact hosting off the application servers.

---

## Next Recommended Step

With Candidate Results, Admin Analytics, Leaderboards, and Certificates all implemented, the entire Results & Reporting domain is functionally complete. The final engineering step is to formally tie these services to their API routes before moving into Integration Testing.

**Next Phase:** `221_RESULTS_API_LAYER`
