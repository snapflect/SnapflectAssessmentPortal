# Sprint 05 – Phase 2: Layout Framework

The primary Layout Framework for the Angular SPA has been successfully deployed. This strictly UI-bound scaffolding establishes the container boundaries and navigation structures for the diverse application personas (Candidates, Organization Admins, and Platform Admins).

## Layout Architecture & Locations

The following standalone components have been structurally initialized:

### Root Layouts (`src/app/layout/`)
*   `AuthLayoutComponent`: Isolated, centralized shell designed specifically for unauthenticated login/registration flows.
*   `AdminLayoutComponent`: Material Sidenav-driven layout for Platform Admins, Organization Admins, and Evaluators.
*   `CandidateLayoutComponent`: Simplified top-navigation layout maximizing focal space for assessment execution.

### Shared UI Shells (`src/app/shared/components/`)
*   `TopbarComponent`: Unified application header with dynamic menu toggle emission.
*   `SidebarComponent`: Structurally isolated left-panel wrapper for administrative menus.
*   `FooterComponent`: Universal system footer.
*   `BreadcrumbComponent`: Visual route hierarchical indicator.
*   `NotificationPanelComponent`: Real-time notification menu trigger utilizing Angular Material Badges.

### Navigation Hierarchy (`src/app/layout/navigation/`)
*   `AdminNavigationComponent`: Segmented `mat-nav-list` dynamically presenting links across PLATFORM ADMIN, ORGANIZATION ADMIN, and EVALUATOR boundaries.
*   `CandidateNavigationComponent`: Horizontal `mat-button` sequence optimized for the simplified Candidate UX.

### Dashboard Core (`src/app/layout/dashboard-shell/`)
*   `DashboardContainerComponent`: Global padding and wrapper containing breadcrumbs.
*   `DashboardContentComponent`: The central `mat-card` surface area where feature modules will ultimately project their internal routes.

## Design & UI Rule Adherence
*   **Material 3 Standardization:** The UI strictly imports and deploys `@angular/material` structural components (`MatSidenavModule`, `MatToolbarModule`, `MatListModule`).
*   **Responsiveness:** The `AdminLayoutComponent` natively supports a mobile-first `Signal` trigger to swap the sidebar between `side` (desktop) and `over` (mobile/tablet) modes, protecting the viewport.
*   **Typography:** The SCSS rules explicitly target the `Inter` font stack, aligning with the `081_UI_UX_STANDARDS_v1.0`.

## Architectural Enforcement
*   **Zero Logic Rule:** There is strictly zero `HttpClient`, zero `Observable` fetching, and zero business logic within these layers. They operate as purely cosmetic, structural wrappers waiting to be populated by the core features.
*   **Role Awareness vs. Authorization:** The navigation menus explicitly present the role tiers (e.g., PLATFORM ADMIN), but **no authorization logic** was placed inside them, respecting the strict decoupling rule pending the actual Auth Module implementation.

## Next Steps
Awaiting your command to proceed to Phase 3 or further Sprint 05 execution directives.
