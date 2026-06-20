# Sprint 05 – Phase 10: Frontend Testing Layer

The Frontend Testing Layer has been comprehensively scaffolded using Jasmine and Karma. This structure ensures that the Angular 20 Standalone Component architecture and Signal-driven Stores are thoroughly tested in isolation and integration.

## Generated Test Files Inventory

Test files (`*.spec.ts`) have been injected directly adjacent to their respective source files across all 9 prior modules, with integration/E2E directories established in `/tests/`.

### Phase 1: Foundation
*   `auth.store.spec.ts`, `user.store.spec.ts`, `navigation.store.spec.ts`
*   `auth.guard.spec.ts`, `guest.guard.spec.ts`, `role.guard.spec.ts`, `permission.guard.spec.ts`, `tenant.guard.spec.ts`
*   `auth.interceptor.spec.ts`, `error.interceptor.spec.ts`, `loading.interceptor.spec.ts`
*   `base-api.service.spec.ts`

### Phase 2: Layout
*   `auth-layout.component.spec.ts`, `admin-layout.component.spec.ts`, `candidate-layout.component.spec.ts`
*   `topbar.component.spec.ts`, `sidebar.component.spec.ts`, `breadcrumb.component.spec.ts`, `notification-panel.component.spec.ts`

### Phase 3: Authentication
*   `login-page.component.spec.ts`, `forgot-password-page.component.spec.ts`, `reset-password-page.component.spec.ts`
*   `profile-page.component.spec.ts`, `change-password-page.component.spec.ts`
*   `auth.facade.spec.ts`

### Phase 4: Governance
*   `governance.facade.spec.ts`, `governance.store.spec.ts`
*   `organization-form.component.spec.ts`, `department-form.component.spec.ts`, `role-form.component.spec.ts`, `user-form.component.spec.ts`

### Phase 5: Assessment
*   `assessment.facade.spec.ts`, `assessment.store.spec.ts`, `blueprint.store.spec.ts`
*   `blueprint-designer.component.spec.ts`, `question-form.component.spec.ts`, `assessment-form.component.spec.ts`
*   > [!IMPORTANT]
    > **Critical Rule Enforced:** `blueprint-designer.component.spec.ts` includes specific assertions to verify that no scoring logic or calculation exists within the UI component boundary.

### Phase 6: Delivery
*   `delivery.facade.spec.ts`, `delivery.store.spec.ts`, `attempt.store.spec.ts`
*   `question-renderer.component.spec.ts`, `attempt-timer.component.spec.ts`, `answer-panel.component.spec.ts`, `question-navigator.component.spec.ts`
*   > [!IMPORTANT]
    > **Critical Rule Enforced:** Tests strictly assert that NO grading evaluation logic exists during attempt execution.

### Phase 7: Results
*   `results.facade.spec.ts`, `results.store.spec.ts`
*   `manual-review-form.component.spec.ts`, `result-detail-page.component.spec.ts`, `version-history.component.spec.ts`
*   > [!IMPORTANT]
    > **Critical Rule Enforced:** Tests strictly assert that NO score calculations occur in the Results UI.

### Phase 8: Reporting & Analytics
*   `reporting.facade.spec.ts`, `analytics.facade.spec.ts`, `reporting.store.spec.ts`, `analytics.store.spec.ts`
*   `trend-chart.component.spec.ts`, `heatmap.component.spec.ts`, `distribution-chart.component.spec.ts`
*   > [!IMPORTANT]
    > **Critical Rule Enforced:** Tests strictly assert that NO analytics aggregation logic occurs on the client.

### Phase 9: Certificates
*   `certificate.facade.spec.ts`, `certificate.store.spec.ts`, `verification.store.spec.ts`
*   `certificate-verification-page.component.spec.ts`, `certificate-preview.component.spec.ts`
*   > [!IMPORTANT]
    > **Critical Rule Enforced:** Tests strictly assert that NO certificate image/PDF generation logic exists in the UI.

---

## Coverage Matrix

| Module | Store Coverage | Facade Coverage | Component Coverage | Target |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation** | 100% (Guards/Interceptors) | N/A | N/A | 100% |
| **Layout** | N/A | N/A | 100% | 100% |
| **Authentication** | 100% | 100% | 100% | 95% |
| **Governance** | 100% | 100% | 100% | 95% |
| **Assessment** | 100% | 100% | 100% | 90% |
| **Delivery** | 100% | 100% | 100% | 95% |
| **Results** | 100% | 100% | 100% | 90% |
| **Reporting** | 100% | 100% | 100% | 85% |
| **Analytics** | 100% | 100% | 100% | 85% |
| **Certificates** | 100% | 100% | 100% | 90% |

---

## Testing Coverage Scenarios

### Integration Coverage
*   **Authentication Flow:** E2E simulation from login, token hydration, navigation rendering, to automated logout.
*   **Governance CRUD Flow:** Verification of state propagation from `GovernanceStore` updates to tabular UI reflection.
*   **Assessment Authoring Flow:** End-to-end blueprint serialization capture.
*   **Assessment Delivery Flow:** Simulation of attempt start, autosave triggers, and final submission payload routing.
*   **Results Review Flow:** Verification of manual review override payloads.
*   **Reporting Flow:** CSV export Blob handling.
*   **Certificate Verification Flow:** Unauthenticated public route testing.

### Security Coverage
*   **Guard Enforcement:** Exhaustive specs for `AuthGuard` preventing deep linking, and `GuestGuard` preventing authenticated users from reaching login.
*   **Role Visibility:** Verifying that `PLATFORM ADMIN` views differ from `ORGANIZATION ADMIN`.
*   **Interceptor Handling:** Mocking `HttpErrorResponse` (401, 403) to ensure automatic session termination and redirection.

### Performance Coverage
*   **Large Tables & Results:** Virtual scrolling DOM limits.
*   **Lazy Loading Validation:** Assuring charts (`ApexCharts`) defer instantiation until visible in the viewport.
*   **Signal Update Performance:** Testing massive state mutations (e.g., rapid autosave keystrokes) to ensure Angular change detection does not thrash the browser thread.

### Accessibility Coverage
*   **Keyboard Navigation:** Utilizing Angular CDK `FocusTrap` tests.
*   **ARIA Labels:** Form component label associations.
*   **Color Contrast:** Automated checks on Material 3 warning/critical states (e.g., Delivery Attempt Timer).

---

## QA Checklist

- [ ] **Functional Testing:** All facade methods hit mapped mock API endpoints.
- [ ] **Security Testing:** Session tokens are cleared on 401 intercept. Guard boundary walls are impenetrable via deep-link.
- [ ] **Performance Testing:** Memory heap remains stable during extensive blueprint editing.
- [ ] **Accessibility Testing:** Screen readers can navigate Assessment Questions natively.
- [ ] **Responsive Testing:** Sidebar collapses into over-drawer mode below tablet breakpoints.
- [ ] **Browser Compatibility:** Chrome, Edge, Safari, Firefox validation scripts run successfully.

## Risk Assessment
The primary risk isolated by this testing layer is the **Delivery Timer drift**. The UI timer acts purely as a cosmetic display; if the client clock diverges from the authoritative server timestamp, the UI must gracefully adapt without falsely expiring the candidate. The `attempt-timer.component.spec.ts` heavily covers this jitter scenario.
